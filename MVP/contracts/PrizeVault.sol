// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import "./interfaces/IOracle.sol";
import "./interfaces/ISwapper.sol";
import "./interfaces/IPrizePool.sol";
/**
 * @title OndoStrategy
 * @dev Estrategia que convierte USDC en USDY de Ondo Finance para generar intereses.
 * Protege el principal 1:1 y envía el yield generado al PrizePool.
 */
contract OndoStrategy is Ownable {
    using SafeERC20 for IERC20;

    IERC20 public immutable usdc;
    IERC20 public immutable usdy;
    
    address public vault;
    address public prizePool;
    
    ISwapper public swapper;
    IOracle public usdyOracle;

    // Aquí guardamos CELOSAMENTE la cantidad de USDC que pertenece a los usuarios
    uint256 private _principal; 

    // --- Eventos ---
    event Invested(uint256 usdcAmount, uint256 usdyReceived);
    event Divested(uint256 usdcAmount, uint256 usdySold);
    event Harvested(uint256 yieldInUsdc);
    event VaultUpdated(address indexed newVault);
    event PrizePoolUpdated(address indexed newPrizePool);

    // --- Modificadores ---
    modifier onlyVault() {
        require(msg.sender == vault, "OndoStrategy: Only Vault can call");
        _;
    }

    constructor(
        address _usdc,
        address _usdy,
        address _swapper,
        address _usdyOracle,
        address _initialOwner
    ) Ownable(_initialOwner) {
        usdc = IERC20(_usdc);
        usdy = IERC20(_usdy);
        swapper = ISwapper(_swapper);
        usdyOracle = IOracle(_usdyOracle);
    }

    // --- Configuración ---

    function setVault(address _vault) external onlyOwner {
        vault = _vault;
        emit VaultUpdated(_vault);
    }

    function setPrizePool(address _prizePool) external onlyOwner {
        prizePool = _prizePool;
        emit PrizePoolUpdated(_prizePool);
    }

    // --- Lógica Principal (Llamada por el Vault) ---

    /**
     * @dev Recibe USDC del Vault, los cambia por USDY y suma al principal.
     */
    function invest(uint256 amount) external onlyVault {
        require(amount > 0, "Amount must be > 0");

        // 1. Traemos los USDC desde el Vault a la Estrategia
        usdc.safeTransferFrom(msg.sender, address(this), amount);

        // 2. Sumamos al principal adeudado
        _principal += amount;

        // 3. Aprobamos y cambiamos USDC por USDY
        usdc.forceApprove(address(swapper), amount);
        uint256 usdyReceived = swapper.swapExactInput(address(usdc), address(usdy), amount, 0);

        emit Invested(amount, usdyReceived);
    }

    /**
     * @dev El Vault necesita liquidez. Cambiamos USDY a USDC y se los enviamos.
     */
    function divest(uint256 amount) external onlyVault {
        require(amount > 0, "Amount must be > 0");
        require(amount <= _principal, "Not enough principal");

        // 1. Restamos del principal (ya que se van a retirar)
        _principal -= amount;

        // 2. Cambiamos la cantidad exacta de USDY necesaria para obtener 'amount' USDC
        // En un entorno real, usaríamos swapExactOutput
        usdy.forceApprove(address(swapper), type(uint256).max);
        uint256 usdySold = swapper.swapExactOutput(address(usdy), address(usdc), amount, type(uint256).max);

        // 3. Enviamos los USDC de vuelta al Vault
        usdc.safeTransfer(vault, amount);

        emit Divested(amount, usdySold);
    }

    /**
     * @dev Retorna el principal exacto. El Vault usa esto para saber que no ha perdido dinero.
     */
    function getPrincipal() external view returns (uint256) {
        return _principal;
    }

    // --- Lógica de Yield (La "magia" de la Lotería) ---

    /**
     * @dev Calcula el interés generado, liquida esa parte de USDY y la envía al PrizePool.
     * Puede ser llamada por un keeper o automatización (ej. Chainlink Automation).
     */
    function harvest() external {
        require(prizePool != address(0), "PrizePool not set");

        // 1. Calcular el valor total de nuestra posición en USDY (convertido a USDC)
        uint256 usdyBalance = usdy.balanceOf(address(this));
        uint256 usdyPrice = usdyOracle.getPrice(); // Precio con 18 decimales
        
        // Asumiendo que USDY tiene 18 decimales y USDC 6 decimales.
        // Fórmula general para obtener valor en USDC: (balance * precio) / 1e18
        uint256 totalValueInUsdc = (usdyBalance * usdyPrice) / 1e18;

        // 2. Si el valor total es mayor al principal, tenemos YIELD (Ganancias)
        if (totalValueInUsdc > _principal) {
            uint256 yieldInUsdc = totalValueInUsdc - _principal;

            // 3. Cambiamos la porción de USDY equivalente a las ganancias por USDC
            usdy.forceApprove(address(swapper), type(uint256).max);
            swapper.swapExactOutput(address(usdy), address(usdc), yieldInUsdc, type(uint256).max);

           // 4. Ejecutamos la función del PrizePool para que reciba y divida el yield
        uint256 usdcHarvested = usdc.balanceOf(address(this)); 
        usdc.forceApprove(prizePool, usdcHarvested);
        IPrizePool(prizePool).addYield(usdcHarvested);

            emit Harvested(usdcHarvested);
        }
    }
}
