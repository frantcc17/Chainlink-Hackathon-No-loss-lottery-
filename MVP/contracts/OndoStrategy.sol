// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

// Interfaces de Chainlink VRF (Verifiable Random Function) V2
import "lib/chainlink-brownie-contracts/contracts/src/v0.8/vrf/interfaces/VRFCoordinatorV2Interface.sol";
import "lib/chainlink-brownie-contracts/contracts/src/v0.8/vrf/VRFConsumerBaseV2.sol";
/**
 * @title PrizePool
 * @dev Recibe yield, lo divide (80/10/10) y sortea el premio usando Chainlink VRF.
 */
contract PrizePool is VRFConsumerBaseV2, Ownable {
    using SafeERC20 for IERC20;

    IERC20 public immutable usdc;
    
    // Direcciones de distribución
    address public treasury;
    address public liquidityProviders;

    // Contabilidad del pozo actual y premios de los usuarios
    uint256 public currentPrizePool;
    mapping(address => uint256) public winnings;

    // --- MVP: Lista simple de jugadores ---
    // En producción, esto se reemplaza por un sistema TWAB basado en los shares del Vault.
    address[] public players;
    mapping(address => bool) public isPlayer;

    // --- Configuración de Chainlink VRF ---
    VRFCoordinatorV2Interface public immutable vrfCoordinator;
    uint64 public subscriptionId;
    bytes32 public keyHash;
    uint32 public callbackGasLimit = 100000;
    uint16 public requestConfirmations = 3;
    uint32 public numWords = 1;

    // Estado del sorteo
    uint256 public lastRequestId;
    bool public isDrawInProgress;

    // --- Eventos ---
    event YieldReceivedAndSplit(uint256 totalAmount, uint256 prize, uint256 treasuryAmount, uint256 lpAmount);
    event DrawStarted(uint256 requestId);
    event WinnerSelected(address indexed winner, uint256 amountWon);
    event PrizeClaimed(address indexed winner, uint256 amount);

    constructor(
        address _usdc,
        address _treasury,
        address _liquidityProviders,
        address _vrfCoordinator,
        bytes32 _keyHash,
        uint64 _subscriptionId,
        address _initialOwner
    ) VRFConsumerBaseV2(_vrfCoordinator) Ownable(_initialOwner) {
        usdc = IERC20(_usdc);
        treasury = _treasury;
        liquidityProviders = _liquidityProviders;
        
        vrfCoordinator = VRFCoordinatorV2Interface(_vrfCoordinator);
        keyHash = _keyHash;
        subscriptionId = _subscriptionId;
    }

    // --- 1. Distribución del Yield (Splits) ---

    /**
     * @dev Llamado por el Vault/Estrategia tras el harvest. 
     * Recibe USDC y lo divide: 80% Pool, 10% Tesorería, 10% LP.
     */
    function addYield(uint256 amount) external {
        require(amount > 0, "Amount must be > 0");

        // Traer los USDC a este contrato
        usdc.safeTransferFrom(msg.sender, address(this), amount);

        // Calcular los porcentajes
        uint256 prizeShare = (amount * 80) / 100;         // 80%
        uint256 treasuryShare = (amount * 10) / 100;      // 10%
        uint256 lpShare = amount - prizeShare - treasuryShare; // El resto (10% exacto, evita polvo)

        // Actualizar el pozo de premios
        currentPrizePool += prizeShare;

        // Enviar fondos a Tesorería y LP inmediatamente
        usdc.safeTransfer(treasury, treasuryShare);
        usdc.safeTransfer(liquidityProviders, lpShare);

        emit YieldReceivedAndSplit(amount, prizeShare, treasuryShare, lpShare);
    }

    // --- 2. Lógica del Sorteo (Chainlink VRF) ---

    /**
     * @dev Inicia el sorteo pidiendo un número aleatorio a Chainlink.
     */
    function startDraw() external onlyOwner {
        require(!isDrawInProgress, "Draw already in progress");
        require(players.length > 0, "No players in pool");
        require(currentPrizePool > 0, "No prize to draw");

        isDrawInProgress = true;

        // Petición a Chainlink
        lastRequestId = vrfCoordinator.requestRandomWords(
            keyHash,
            subscriptionId,
            requestConfirmations,
            callbackGasLimit,
            numWords
        );

        emit DrawStarted(lastRequestId);
    }

    /**
     * @dev Callback de Chainlink. Recibe el número aleatorio y elige al ganador.
     */
    function fulfillRandomWords(uint256 /* requestId */, uint256[] memory randomWords) internal override {
        require(isDrawInProgress, "No draw in progress");

        uint256 randomIndex = randomWords[0] % players.length;
        address winner = players[randomIndex];

        uint256 prizeWon = currentPrizePool;
        
        // Asignar el premio al ganador y resetear el pozo
        winnings[winner] += prizeWon;
        currentPrizePool = 0;
        isDrawInProgress = false;

        emit WinnerSelected(winner, prizeWon);
    }

    // --- 3. Reclamación de Premios ---

    /**
     * @dev Los ganadores llaman a esta función para retirar sus USDC.
     */
    function claimPrize() external {
        uint256 amount = winnings[msg.sender];
        require(amount > 0, "No prize to claim");

        // Poner a 0 antes de transferir para evitar ataques de reentrada (Checks-Effects-Interactions)
        winnings[msg.sender] = 0;

        usdc.safeTransfer(msg.sender, amount);

        emit PrizeClaimed(msg.sender, amount);
    }

    // --- Utilidades para el MVP (Gestión de Jugadores) ---
    
    // El Vault llamaría a estas funciones en el _deposit y _withdraw
    function addPlayer(address player) external {
        if (!isPlayer[player]) {
            isPlayer[player] = true;
            players.push(player);
        }
    }
}
