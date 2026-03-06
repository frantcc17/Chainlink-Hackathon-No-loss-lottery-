// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;
interface ISwapper {
    // Interfaz genérica para cambiar tokens (ej. un Router de Uniswap)
    function swapExactInput(
        address tokenIn,
        address tokenOut,
        uint256 amountIn,
        uint256 amountOutMinimum
    ) external returns (uint256 amountOut);

    function swapExactOutput(
        address tokenIn,
        address tokenOut,
        uint256 amountOut,
        uint256 amountInMaximum
    ) external returns (uint256 amountIn);
}
