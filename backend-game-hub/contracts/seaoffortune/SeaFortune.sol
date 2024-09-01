// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { AxelarExecutable } from "@axelar-network/axelar-gmp-sdk-solidity/contracts/executable/AxelarExecutable.sol";
import "@axelar-network/axelar-gmp-sdk-solidity/contracts/interfaces/IAxelarGateway.sol";
import "@axelar-network/axelar-gmp-sdk-solidity/contracts/interfaces/IAxelarGasService.sol";

contract SeaFortune is AxelarExecutable {
    address public owner;

    uint256 public feePercentage; 
    uint256 public mapOwnerPercentage; 
    uint256 public communityPercentage; 
    uint256 public pointsPercentage; 
    uint256 public winnerPercentage; 

    address public communityWallet;

    IAxelarGasService public immutable gasService;
    mapping(string => string) public trustedRemotes;

    struct Player {
        address playerAddress;
        uint256 points;
        uint256 towersLeft;
    }

    struct Room {
        Player player1;
        Player player2;
        uint256 betAmount;
        bool isActive;
        address winner;
        bool betPaid;
        address mapOwner;
    }

    mapping(uint256 => Room) public rooms;
    uint256 public roomCounter;

    IERC20 public token;

    event RoomCreated(uint256 roomId, uint256 betAmount);
    event PlayerJoined(uint256 roomId, address player);
    event WinnerDeclared(uint256 roomId, address winner);
    event WinningsWithdrawn(uint256 roomId, address winner, uint256 amountWon, uint256 pointsAmount, uint256 communityFee, uint256 mapOwnerFee);
    event CrossChainWithdrawalInitiated(uint256 roomId, address winner, string destinationChain, address destinationAddress, uint256 amount);

    constructor(
        address _tokenAddress,
        address _communityWallet,
        uint256 _feePercentage,
        uint256 _mapOwnerPercentage,
        uint256 _communityPercentage,
        uint256 _pointsPercentage,
        uint256 _winnerPercentage,
        address gateway,
        address gasServiceAddress
    ) AxelarExecutable(gateway) {
        owner = msg.sender;
        token = IERC20(_tokenAddress);
        communityWallet = _communityWallet;

        feePercentage = _feePercentage;
        mapOwnerPercentage = _mapOwnerPercentage;
        communityPercentage = _communityPercentage;
        pointsPercentage = _pointsPercentage;
        winnerPercentage = _winnerPercentage;

        gasService = IAxelarGasService(gasServiceAddress);
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Not the owner");
        _;
    }

    modifier onlyPlayer(uint256 _roomId) {
        require(
            msg.sender == rooms[_roomId].player1.playerAddress || msg.sender == rooms[_roomId].player2.playerAddress,
            "Not a player in this room"
        );
        _;
    }

    function registerRoom(uint256 _betAmount, address _mapOwner) public onlyOwner returns (uint256) {
        roomCounter++;
        rooms[roomCounter] = Room({
            player1: Player(address(0), 0, 3),
            player2: Player(address(0), 0, 3),
            betAmount: _betAmount,
            isActive: true,
            winner: address(0),
            betPaid: false,
            mapOwner: _mapOwner
        });
        emit RoomCreated(roomCounter, _betAmount);
        return roomCounter;
    }

    function joinRoom(uint256 _roomId) public {
        Room storage room = rooms[_roomId];
        require(room.isActive, "Room is not active");

        if (room.player1.playerAddress == address(0)) {
            room.player1.playerAddress = msg.sender;
        } else {
            require(room.player2.playerAddress == address(0), "Room already has two players");
            room.player2.playerAddress = msg.sender;
        }

        token.transferFrom(msg.sender, address(this), room.betAmount);
        emit PlayerJoined(_roomId, msg.sender);
    }

    function registerTowerDestruction(uint256 _roomId, address _player) public onlyOwner {
        Room storage room = rooms[_roomId];
        require(room.isActive, "Room is not active");
        require(_player == room.player1.playerAddress || _player == room.player2.playerAddress, "Not a player in this room");

        if (_player == room.player1.playerAddress) {
            room.player1.points++;
            room.player2.towersLeft--;
        } else {
            room.player2.points++;
            room.player1.towersLeft--;
        }
    }

    function declareWinner(uint256 _roomId, address _winner) public onlyOwner {
        Room storage room = rooms[_roomId];
        require(room.isActive, "Room is not active");
        require(room.player1.playerAddress == _winner || room.player2.playerAddress == _winner, "Winner must be a player in this room");

        room.winner = _winner;
        room.isActive = false;
        emit WinnerDeclared(_roomId, _winner);
    }

    function withdrawWinnings(uint256 _roomId) public onlyPlayer(_roomId) {
        Room storage room = rooms[_roomId];
        require(room.winner != address(0), "No winner declared");
        require(!room.betPaid, "Winnings already withdrawn");

        uint256 totalBet = room.betAmount * 2;
        uint256 winnerAmount = (totalBet * winnerPercentage) / 100;
        uint256 pointsAmount = (totalBet * pointsPercentage) / 100;
        uint256 communityFee = (totalBet * communityPercentage) / 100;
        uint256 mapOwnerFee = (totalBet * mapOwnerPercentage) / 100;

        uint256 player1Share = (pointsAmount * room.player1.points) / (room.player1.points + room.player2.points);
        uint256 player2Share = pointsAmount - player1Share;

        if (msg.sender == room.winner) {
            token.transfer(msg.sender, winnerAmount);
        } 

        if (msg.sender == room.player1.playerAddress) {
            token.transfer(msg.sender, player1Share);
        } else if (msg.sender == room.player2.playerAddress) {
            token.transfer(msg.sender, player2Share);
        }

        token.transfer(communityWallet, communityFee);
        token.transfer(room.mapOwner, mapOwnerFee);
        token.transfer(owner, (totalBet * feePercentage) / 100);

        room.betPaid = true;
        emit WinningsWithdrawn(_roomId, room.winner, winnerAmount, pointsAmount, communityFee, mapOwnerFee);
    }

    // Function to set trusted remote addresses for cross-chain communication.
    function setTrustedRemote(string calldata chain, string calldata remoteAddress) external onlyOwner {
        trustedRemotes[chain] = remoteAddress;
    }

    // New function to withdraw winnings cross-chain
    function withdrawWinningsCrossChain(
        uint256 _roomId,
        string calldata destinationChain,
        address destinationAddress
    ) public payable onlyPlayer(_roomId) {
        Room storage room = rooms[_roomId];
        require(room.winner != address(0), "No winner declared");
        require(!room.betPaid, "Winnings already withdrawn");
        require(bytes(trustedRemotes[destinationChain]).length > 0, "Destination chain not trusted");

        uint256 totalBet = room.betAmount * 2;
        uint256 winnerAmount = (totalBet * winnerPercentage) / 100;

        // Prepare the payload for cross-chain transfer
        bytes memory payload = abi.encode(destinationAddress, winnerAmount);

        // Pay for the gas required for the cross-chain transfer
        if (msg.value > 0) {
            gasService.payNativeGasForContractCall{value: msg.value}(
                address(this),
                destinationChain,
                trustedRemotes[destinationChain],
                payload,
                msg.sender
            );
        }

        // Initiate the cross-chain transfer through Axelar
        gateway.callContract(destinationChain, trustedRemotes[destinationChain], payload);

        // Deduct and transfer the community fee and map owner fee
        uint256 communityFee = (totalBet * communityPercentage) / 100;
        uint256 mapOwnerFee = (totalBet * mapOwnerPercentage) / 100;

        token.transfer(communityWallet, communityFee);
        token.transfer(room.mapOwner, mapOwnerFee);
        token.transfer(owner, (totalBet * feePercentage) / 100);

        room.betPaid = true;
        emit CrossChainWithdrawalInitiated(_roomId, room.winner, destinationChain, destinationAddress, winnerAmount);
    }

    // Internal function to handle the execution of cross-chain transfers
    function _execute(
        string calldata sourceChain,
        string calldata sourceAddress,
        bytes calldata payload
    ) internal override {
        require(keccak256(bytes(sourceAddress)) == keccak256(bytes(trustedRemotes[sourceChain])), "Not a trusted source");

        // Decode the payload to get the destination address and token amount
        (address recipient, uint256 amount) = abi.decode(payload, (address, uint256));

        // Transfer the tokens to the recipient on the destination chain
        token.transfer(recipient, amount);
    }

    function changeCommunityWallet(address _newWallet) public onlyOwner {
        communityWallet = _newWallet;
    }

    function withdrawOwnerTokens() public onlyOwner {
        uint256 balance = token.balanceOf(address(this));
        token.transfer(owner, balance);
    }
}
