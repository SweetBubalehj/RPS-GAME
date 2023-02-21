pragma solidity >=0.8.0 <0.9.0;
//SPDX-License-Identifier: MIT

import "hardhat/console.sol";

import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
import "@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol";
import "@chainlink/contracts/src/v0.8/ConfirmedOwner.sol";

contract Rps is VRFConsumerBaseV2, ConfirmedOwner {
    uint public immutable minBid;
    uint public immutable maxBid;
    uint8 public constant COMISSION = 10;

    struct Game {
        address user;
        uint bid;
        uint8 amountRounds;
        uint8[] winnerByRound;
        uint8[] userOptions;
        uint8[] contractOptions;
        GameStatus status;
    }

    enum GameOption {
        NO_OPTI0N,
        ROCK,
        PAPER, 
        SCISSORS
    }

    enum GameStatus {
        NOT_INITIATED,
        ONGOING,
        USER_WON, 
        USER_LOST,
        TIE
    }
    
    event GameCreated(address indexed user, uint indexed gameId);

    event RoundPassed(address indexed user, uint indexed gameId, uint8 roundWinner);

    event GameFinished(address indexed user, uint indexed gameId, GameStatus status);


    /// @notice Also `rounds` can be only odd number and less than or equal `maxRounds`
    uint8 public constant maxRounds = 5;

    uint public playedGames = 1;

    mapping(uint => Game) public gameByNonce;

    mapping(address => uint) public gameNonceByUser;

    mapping(address => uint) public userReward;

    mapping(uint => uint) public gameNonceByRandomId;

    // CHAINLINK
    VRFCoordinatorV2Interface COORDINATOR;

    uint64 s_subscriptionId;
    
    bytes32 keyHash =
        0xd4bb89654db74673a187bd804519e65e3f71a52bc55f11da7601a13dcf505314;

    uint32 callbackGasLimit = 400000;

    uint16 requestConfirmations = 3;

    uint32 numWords = 1;

    constructor(
        uint _minBid, 
        uint _maxBid, 
        uint64 subscriptionId
    ) 
        VRFConsumerBaseV2(0x6A2AAd07396B36Fe02a22b33cf443582f682c82f)
        ConfirmedOwner(msg.sender)
    {
        minBid = _minBid;
        maxBid = _maxBid;
        s_subscriptionId = subscriptionId;
        COORDINATOR = VRFCoordinatorV2Interface(
            0x6A2AAd07396B36Fe02a22b33cf443582f682c82f
        );
    }

    // to support receiving ETH by default
    receive() external payable {}

    fallback() external payable {}

    function getRoundWinners(address user) external view returns (uint8[] memory roundWinners) {
        uint _nonce = gameNonceByUser[user];
        Game memory game = gameByNonce[_nonce];
        roundWinners = game.winnerByRound;
    }

    function getUserStatus(address user) external view returns (GameStatus _userStatus){
        uint _nonce = gameNonceByUser[user];
        Game memory game = gameByNonce[_nonce];
        _userStatus = game.status;
    }

    function claimReward() external {
        require(userReward[msg.sender] > 0, "RPS: NOTHING_TO_CLAIM");

        uint amount = userReward[msg.sender];

        userReward[msg.sender] = 0;

        require(
            payable(msg.sender).send(amount),
            'RPS: TRANSFER_FAILED'
        );
    }

    function createGame(uint8 _amountRounds, GameOption _firstRoundOption) external payable {
        require(
            _amountRounds <= maxRounds && 
            _amountRounds != 0 &&
            _amountRounds % 2 == 1,
            "RPS: INVALID_OPTION"
        );
        require(
            msg.value >= minBid && 
            msg.value <= maxBid, 
            "RPS: INVALID_BID"
        );
        require(
            _firstRoundOption != GameOption.NO_OPTI0N,
            'RPS: INVALID_ROUND_OPTION'
        );
        require(
            gameByNonce[gameNonceByUser[msg.sender]].status != GameStatus.ONGOING,
            'RPS: ALREADY_HAVE_ONGOING_GAME'
        );
        uint gameNonce = playedGames;
        playedGames++;

        gameByNonce[gameNonce] = Game({
            user: msg.sender,
            bid: msg.value,
            amountRounds: _amountRounds,
            winnerByRound: new uint8[](_amountRounds),
            userOptions: new uint8[](_amountRounds),
            contractOptions: new uint8[](_amountRounds),
            status: GameStatus.ONGOING
        });

        gameNonceByUser[msg.sender] = gameNonce;

        uint randomId = _requestRandomWords();

        gameNonceByRandomId[randomId] = gameNonce;

        gameByNonce[gameNonce].userOptions[0] = uint8(_firstRoundOption);

        emit GameCreated(msg.sender, gameNonce);
    }

    function playRound(GameOption roundOption) external {
        uint gameNonce = gameNonceByUser[msg.sender];
        Game memory game = gameByNonce[gameNonce];

        require(
            game.status == GameStatus.ONGOING,
            'RPS: GAME_ALREADY_FINISHED'
        );
        require(
            roundOption != GameOption.NO_OPTI0N,
            'RPS: INVALID_ROUND_OPTION'
        );
        uint8 currentRound;
        for (uint8 i = 0; i < game.amountRounds; i++) {
            if (game.winnerByRound[i] == 0) {
                currentRound = i;
                break;
            }
        }

        require(
            game.userOptions[currentRound] == 0,
            'RPS: INVALID_ROUND_OPTION'
        );

        uint randomId = _requestRandomWords();

        gameNonceByRandomId[randomId] = gameNonce;

        gameByNonce[gameNonce].userOptions[currentRound] = uint8(roundOption);

    }

    function _proceedGame(
        uint requestId,
        uint randomWord
    ) internal {
        uint gameId = gameNonceByRandomId[requestId];
        Game memory game = gameByNonce[gameId];
        uint8 contractOption = uint8(randomWord % 3) + 1;

        uint8 currentRound;
        for (uint8 i = 0; i < game.amountRounds; i++) {
            if (game.winnerByRound[i] == 0) {
                currentRound = i;
                break;
            }
        }

        uint8 roundWinner = _getRoundWinner(
            GameOption(game.userOptions[currentRound]), 
            GameOption(contractOption)
        );

        gameByNonce[gameId].contractOptions[currentRound] = contractOption;
        gameByNonce[gameId].winnerByRound[currentRound] = roundWinner;

        emit RoundPassed(game.user, gameId, roundWinner);

        if (game.amountRounds == currentRound + 1) {
            _finishGame(gameId);
        }
    }

    function _getRoundWinner(
        GameOption userOption, 
        GameOption contractRandomOption
    ) internal pure returns (uint8) {
        require(
            userOption != GameOption.NO_OPTI0N &&
            contractRandomOption != GameOption.NO_OPTI0N,
            'RPS: INVALID_OPTIONS'
        );
        uint8 winner = 1; // 1 - contract; 2 - user; 3 - tie
        if (userOption == contractRandomOption) {
            winner = 3;
            return winner;
        }
        if (userOption == GameOption.ROCK) {
            if (contractRandomOption == GameOption.SCISSORS) { 
                winner = 2;
            }
        } else if (userOption == GameOption.PAPER) {
            if (contractRandomOption == GameOption.ROCK) { 
                winner = 2;
            }
        } else {
            if (contractRandomOption == GameOption.PAPER) { 
                winner = 2;
            }
        }
        return winner;
    }

    function _finishGame(uint gameNonce) internal {
        Game memory game = gameByNonce[gameNonce];
        require(
            game.winnerByRound[game.winnerByRound.length - 1] != 0,
            'RPS: GAME_NOT_FINISHED'
        );
        uint8 userWins;
        uint8 contractWins;
        for (uint8 i = 0; i < game.amountRounds; i++) {
            if (game.winnerByRound[i] == 1) {
                contractWins++;
            } else if (game.winnerByRound[i] == 2) {
                userWins++;
            }
        }
        if (userWins > contractWins) {
            gameByNonce[gameNonce].status = GameStatus.USER_WON;

            uint userAmount = game.bid + game.bid * uint(100 - COMISSION) / 100;

            userReward[game.user] += userAmount;
        } else if (contractWins > userWins) {
            gameByNonce[gameNonce].status = GameStatus.USER_LOST;

        } else if (contractWins == userWins) {
            gameByNonce[gameNonce].status = GameStatus.TIE;

            userReward[game.user] += game.bid;
        }
        emit GameFinished(game.user, gameNonce, gameByNonce[gameNonce].status);
    }

    // Assumes the subscription is funded sufficiently.
    function _requestRandomWords()
        internal
        returns (uint256 requestId)
    {
        // Will revert if subscription is not set and funded.
        requestId = COORDINATOR.requestRandomWords(
            keyHash,
            s_subscriptionId,
            requestConfirmations,
            callbackGasLimit,
            numWords
        );
        return requestId;
    }

    function fulfillRandomWords(
        uint256 _requestId,
        uint256[] memory _randomWords
    ) internal override {
        require(gameNonceByRandomId[_requestId] != 0, 'VRF: INVALID_REQUEST');
        _proceedGame(_requestId, _randomWords[0]);
    }


}
