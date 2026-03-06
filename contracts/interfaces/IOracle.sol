// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;
interface IOracle {
    // Devuelve el precio de 1 USDY en términos de USDC (escalado a 18 decimales)
    function getPrice() external view returns (uint256); 
}
