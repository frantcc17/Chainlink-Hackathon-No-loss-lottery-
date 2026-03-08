// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

// ✅ VRF v2.5
import {VRFConsumerBaseV2Plus} from "@chainlink/contracts/src/v0.8/vrf/dev/VRFConsumerBaseV2Plus.sol";
import {VRFV2PlusClient} from "@chainlink/contracts/src/v0.8/vrf/dev/libraries/VRFV2PlusClient.sol";
import {IVRFCoordinatorV2Plus} from "@chainlink/contracts/src/v0.8/vrf/dev/interfaces/IVRFCoordinatorV2Plus.sol";

/**
 * @title PrizePool
 * @dev Recibe yield, lo divide (80/10/10) y sortea el premio usando Chainlink VRF v2.5.
 */
contract PrizePool is VRFConsumerBaseV2Plus {
    using SafeERC20 for IERC20;

    IERC20 public immutable usdc;

    address public treasury;
    address public liquidityProviders;

    uint256 public currentPrizePool;
    mapping(address => uint256) public winnings;

    address[] public players;
    mapping(address => bool) public isPlayer;
    address public lastWinner;

    IVRFCoordinatorV2Plus public immutable vrfCoordinatorV2Plus;
    uint256 public subscriptionId;
    bytes32 public keyHash;
    uint32 public callbackGasLimit = 100000;
    uint16 public requestConfirmations = 3;
    uint32 public numWords = 1;

    uint256 public lastRequestId;
    bool public isDrawInProgress;

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
        uint256 _subscriptionId
    ) VRFConsumerBaseV2Plus(_vrfCoordinator) {
        usdc = IERC20(_usdc);
        treasury = _treasury;
        liquidityProviders = _liquidityProviders;
        vrfCoordinatorV2Plus = IVRFCoordinatorV2Plus(_vrfCoordinator);
        keyHash = _keyHash;
        subscriptionId = _subscriptionId;
    }

    // ✅ onlyOwner ahora usa el modifier de VRFConsumerBaseV2Plus
    function addYield(uint256 amount) external {
        require(amount > 0, "Amount must be > 0");

        usdc.safeTransferFrom(msg.sender, address(this), amount);

        uint256 prizeShare = (amount * 80) / 100;
        uint256 treasuryShare = (amount * 10) / 100;
        uint256 lpShare = amount - prizeShare - treasuryShare;

        currentPrizePool += prizeShare;

        usdc.safeTransfer(treasury, treasuryShare);
        usdc.safeTransfer(liquidityProviders, lpShare);

        emit YieldReceivedAndSplit(amount, prizeShare, treasuryShare, lpShare);
    }

    function startDraw() external onlyOwner {
        require(!isDrawInProgress, "Draw already in progress");
        require(players.length > 0, "No players in pool");
        require(currentPrizePool > 0, "No prize to draw");

        isDrawInProgress = true;

        lastRequestId = vrfCoordinatorV2Plus.requestRandomWords(
            VRFV2PlusClient.RandomWordsRequest({
                keyHash: keyHash,
                subId: subscriptionId,
                requestConfirmations: requestConfirmations,
                callbackGasLimit: callbackGasLimit,
                numWords: numWords,
                extraArgs: VRFV2PlusClient._argsToBytes(
                    VRFV2PlusClient.ExtraArgsV1({ nativePayment: false })
                )
            })
        );

        emit DrawStarted(lastRequestId);
    }

    function fulfillRandomWords(uint256 /* requestId */, uint256[] calldata randomWords) internal override {
        require(isDrawInProgress, "No draw in progress");

        uint256 randomIndex = randomWords[0] % players.length;
        address winner = players[randomIndex];

        uint256 prizeWon = currentPrizePool;

        winnings[winner] += prizeWon;
        currentPrizePool = 0;
        isDrawInProgress = false;
        lastWinner = winner;

        emit WinnerSelected(winner, prizeWon);
    }

    function claimPrize() external {
        uint256 amount = winnings[msg.sender];
        require(amount > 0, "No prize to claim");

        winnings[msg.sender] = 0;
        usdc.safeTransfer(msg.sender, amount);

        emit PrizeClaimed(msg.sender, amount);
    }

    function addPlayer(address player) external {
        if (!isPlayer[player]) {
            isPlayer[player] = true;
            players.push(player);
        }
    }
}
