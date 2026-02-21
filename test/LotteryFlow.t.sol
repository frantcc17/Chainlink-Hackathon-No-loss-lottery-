// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Test, console2} from "forge-std/Test.sol";
import "src/PrizeVault.sol";
import "src/OndoStrategy.sol";
import  "src/PrizePool.sol";
import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

// --- 1. Mocks (Simuladores de ecosistema) ---

contract MockToken is ERC20 {
    constructor(string memory name, string memory symbol) ERC20(name, symbol) {}
    function mint(address to, uint256 amount) external { _mint(to, amount); }
}

contract MockOracle {
    uint256 public price = 1e18; // 1 USDY = 1 USDC al inicio
    function setPrice(uint256 _price) external { price = _price; }
    function getPrice() external view returns (uint256) { return price; }
}

contract MockSwapper {
    MockToken public usdc;
    MockToken public usdy;
    constructor(address _usdc, address _usdy) {
        usdc = MockToken(_usdc);
        usdy = MockToken(_usdy);
    }
    // Simula cambiar USDC por USDY 1:1
    function swapExactInput(address, address, uint256 amountIn, uint256) external returns (uint256) {
        usdc.transferFrom(msg.sender, address(this), amountIn);
        usdy.mint(msg.sender, amountIn);
        return amountIn;
    }
    // Simula cambiar USDY por USDC 1:1
    function swapExactOutput(address, address, uint256 amountOut, uint256) external returns (uint256) {
        usdy.transferFrom(msg.sender, address(this), amountOut); // Asume ratio 1:1 para simplificar el test
        usdc.mint(msg.sender, amountOut);
        return amountOut;
    }
}

contract MockVRF {
    address public consumer;
    function setConsumer(address _consumer) external { consumer = _consumer; }
    function requestRandomWords(bytes32, uint64, uint16, uint32, uint32) external pure returns (uint256) {
        return 1; // Retorna un ID de request falso
    }
    // Nosotros llamaremos a esto manualmente en el test para simular que Chainlink respondió
    function fulfill(uint256[] memory randomWords) external {
        (bool success, ) = consumer.call(
            abi.encodeWithSignature("rawFulfillRandomWords(uint256,uint256[])", 1, randomWords)
        );
        require(success, "VRF callback failed");
    }
}

// --- 2. El Test Principal ---

contract LotteryFlowTest is Test {
    PrizeVault public vault;
    OndoStrategy public strategy;
    PrizePool public prizePool;
    
    MockToken public usdc;
    MockToken public usdy;
    MockOracle public oracle;
    MockSwapper public swapper;
    MockVRF public vrf;

    address public alice = address(0xA);
    address public bob = address(0xB);
    address public treasury = address(0x1);
    address public lp = address(0x2);

    function setUp() public {
        // 1. Desplegar Mocks
        usdc = new MockToken("USDC", "USDC");
        usdy = new MockToken("USDY", "USDY");
        oracle = new MockOracle();
        swapper = new MockSwapper(address(usdc), address(usdy));
        vrf = new MockVRF();

        // 2. Desplegar Contratos Base
        vault = new PrizeVault(usdc, "Prize USDC", "pUSDC", address(this));
        
        strategy = new OndoStrategy(
            address(usdc), address(usdy), address(swapper), address(oracle), address(this)
        );
        
        prizePool = new PrizePool(
            address(usdc), treasury, lp, address(vrf), bytes32(0), 0, address(this)
        );

        // 3. Conectar la arquitectura
        vault.setStrategy(address(strategy));
        strategy.setVault(address(vault));
        strategy.setPrizePool(address(prizePool));
        vrf.setConsumer(address(prizePool));

        // Dar dinero a Alice y Bob
        usdc.mint(alice, 1000e6);
        usdc.mint(bob, 1000e6);
    }

    function test_FullLotteryFlow() public {
        // --- PASO 1: DEPÓSITOS ---
        vm.startPrank(alice);
        usdc.approve(address(vault), 1000e6);
        vault.deposit(1000e6, alice);
        prizePool.addPlayer(alice); // Simulamos que el Vault registró a Alice
        vm.stopPrank();

        vm.startPrank(bob);
        usdc.approve(address(vault), 1000e6);
        vault.deposit(1000e6, bob);
        prizePool.addPlayer(bob); // Simulamos que el Vault registró a Bob
        vm.stopPrank();

        assertEq(strategy.getPrincipal(), 2000e6, "El principal deberia ser 2000");

        // --- PASO 2: GENERACIÓN DE YIELD (Simulamos que pasa el tiempo y USDY sube de precio) ---
        // Aumentamos el precio del oráculo un 2.5% para simular 50 USDC de ganancia
        oracle.setPrice(1.025e18); 

        // --- PASO 3: HARVEST SEMANAL ---
        strategy.harvest();

        // Verificamos los splits en el PrizePool (50 USDC ganados)
        // 80% = 40 USDC (Premio) | 10% = 5 USDC (Tesoro) | 10% = 5 USDC (LP)
        assertEq(prizePool.currentPrizePool(), 40e6, "El pozo deberia tener 40 USDC");
        assertEq(usdc.balanceOf(treasury), 5e6, "La tesoreria deberia tener 5 USDC");
        assertEq(usdc.balanceOf(lp), 5e6, "Los LP deberian tener 5 USDC");

        // --- PASO 4: SORTEO ---
        prizePool.startDraw();

        // Simulamos la respuesta de Chainlink VRF
        uint256[] memory randomWords = new uint256[](1);
        randomWords[0] = 777; // Un numero aleatorio cualquiera
        vrf.fulfill(randomWords);

        // El ganador es randomWords[0] % players.length (777 % 2 = 1, que es el index de Bob)
        uint256 bobWinnings = prizePool.winnings(bob);
        assertEq(bobWinnings, 40e6, "Bob deberia haber ganado los 40 USDC");

        // --- PASO 5: RECLAMAR PREMIO Y RETIRAR PRINCIPAL ---
        vm.startPrank(bob);
        
        // Bob reclama su premio
        prizePool.claimPrize();
        assertEq(usdc.balanceOf(bob), 40e6, "Bob tiene su premio liquido en su wallet");

        // Bob se retira de la loteria y recupera sus 1000 originales
        vault.withdraw(1000e6, bob, bob);
        assertEq(usdc.balanceOf(bob), 1040e6, "Bob recupero su principal + premio");
        
        vm.stopPrank();
    }
}
