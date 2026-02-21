// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {ERC4626} from "@openzeppelin/contracts/token/ERC20/extensions/ERC4626.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import "./interfaces/IStrategy.sol";

/**
 * @title PrizeVault
 * @dev Vault ERC4626 que acepta USDC y los delega a una estrategia.
 * El principal siempre se mantiene 1:1. El yield se gestiona en la estrategia.
 */
contract PrizeVault is ERC4626, Ownable {
    IStrategy public strategy;

    event StrategyUpdated(address indexed oldStrategy, address indexed newStrategy);

    /**
     * @param _asset El token subyacente (ej. USDC)
     * @param _name Nombre del token de participación (ej. "Prize USDC")
     * @param _symbol Símbolo del token de participación (ej. "pUSDC")
     * @param _initialOwner Dirección del administrador del Vault
     */
    constructor(
        IERC20 _asset,
        string memory _name,
        string memory _symbol,
        address _initialOwner
    ) ERC4626(_asset) ERC20(_name, _symbol) Ownable(_initialOwner) {}

    /**
     * @dev Permite al owner configurar o actualizar el contrato de la estrategia.
     */
    function setStrategy(address _strategy) external onlyOwner {
        address oldStrategy = address(strategy);
        strategy = IStrategy(_strategy);
        emit StrategyUpdated(oldStrategy, _strategy);
    }

    /**
     * @dev Sobrescribimos totalAssets para que el Vault sepa cuánto dinero 
     * tiene en total, sumando su balance líquido + lo que está invertido en la estrategia.
     * La estrategia SOLO debe devolver el "principal" para mantener el ratio 1:1.
     */
    function totalAssets() public view virtual override returns (uint256) {
        uint256 liquidBalance = IERC20(asset()).balanceOf(address(this));
        uint256 investedBalance = address(strategy) != address(0) ? strategy.getPrincipal() : 0;
        
        return liquidBalance + investedBalance;
    }

    /**
     * @dev Hook de OpenZeppelin que se ejecuta DESPUÉS de un depósito.
     * Movemos automáticamente los USDC depositados a la Estrategia.
     */
    function _deposit(
        address caller,
        address receiver,
        uint256 assets,
        uint256 shares
    ) internal virtual override {
        // Ejecuta la lógica estándar del ERC4626 (transferir de usuario a Vault)
        super._deposit(caller, receiver, assets, shares);

        // Si hay una estrategia configurada, enviamos los fondos a trabajar
        if (address(strategy) != address(0)) {
            IERC20(asset()).approve(address(strategy), assets);
            strategy.invest(assets);
        }
    }

    /**
     * @dev Hook de OpenZeppelin que se ejecuta ANTES de un retiro.
     * Si el Vault no tiene suficientes USDC líquidos, los pide a la Estrategia.
     */
    function _withdraw(
        address caller,
        address receiver,
        address owner,
        uint256 assets,
        uint256 shares
    ) internal virtual override {
        uint256 liquidBalance = IERC20(asset()).balanceOf(address(this));
        
        // Si nos falta liquidez para pagar el retiro, desinvertimos de la estrategia
        if (liquidBalance < assets && address(strategy) != address(0)) {
            uint256 shortfall = assets - liquidBalance;
            strategy.divest(shortfall);
        }

        // Ejecuta la lógica estándar del ERC4626 (quemar shares y enviar USDC)
        super._withdraw(caller, receiver, owner, assets, shares);
    }
}
