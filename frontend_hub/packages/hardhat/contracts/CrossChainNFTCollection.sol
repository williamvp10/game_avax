// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Supply.sol";
import { AxelarExecutable } from "@axelar-network/axelar-gmp-sdk-solidity/contracts/executable/AxelarExecutable.sol";
import "@axelar-network/axelar-gmp-sdk-solidity/contracts/interfaces/IAxelarGateway.sol";
import "@axelar-network/axelar-gmp-sdk-solidity/contracts/interfaces/IAxelarGasService.sol";

contract CrossChainNFTCollection is ERC1155, Ownable, ERC1155Supply, AxelarExecutable {
    string public name;
    string public symbol;

    IAxelarGasService public immutable gasService;
    mapping(string => string) public trustedRemotes;

    struct Collection {
        uint256 maxSupply; // 0 indicates no max supply
        uint256 totalMinted;
    }

    mapping(uint256 => Collection) public collections;

    event CollectionCreated(uint256 indexed id, uint256 maxSupply);
    event TokenMinted(uint256 indexed id, address indexed account, uint256 amount);
    event CrossChainTransferInitiated(address indexed sender, string destinationChain, address destinationAddress, uint256 id, uint256 amount);
    event CrossChainTransferExecuted(string sourceChain, string sourceAddress, address recipient, uint256 id, uint256 amount);

    constructor(
        string memory _name, 
        string memory _symbol, 
        address _initialOwner, 
        string memory _initialURI,
        address _gateway,
        address _gasService
    ) 
        ERC1155(_initialURI) 
        Ownable(_initialOwner) 
        AxelarExecutable(_gateway)
    {
        name = _name;
        symbol = _symbol;
        gasService = IAxelarGasService(_gasService);
    }

    // Function to set the URI for all tokens
    function setURI(string memory newuri) public onlyOwner {
        _setURI(newuri);
    }

    // Function to create a new collection
    function createCollection(uint256 id, uint256 maxSupply) external onlyOwner {
        require(collections[id].maxSupply == 0, "Collection already exists");

        collections[id] = Collection({
            maxSupply: maxSupply,
            totalMinted: 0
        });

        emit CollectionCreated(id, maxSupply);
    }

    // Function to mint tokens for a specific collection
    function mint(address account, uint256 id, uint256 amount, bytes memory data) public {
        Collection storage collection = collections[id];
        require(collection.maxSupply > 0 || collection.maxSupply == 0, "Collection does not exist");
        
        // Check if there is a maxSupply and enforce it
        if (collection.maxSupply > 0) {
            require(collection.totalMinted + amount <= collection.maxSupply, "Exceeds max supply");
        }

        collection.totalMinted += amount;
        _mint(account, id, amount, data);

        emit TokenMinted(id, account, amount);
    }

    // Function to mint multiple tokens for different collections at once
    function mintBatch(address to, uint256[] memory ids, uint256[] memory amounts, bytes memory data) public {
        for (uint256 i = 0; i < ids.length; i++) {
            uint256 id = ids[i];
            uint256 amount = amounts[i];

            Collection storage collection = collections[id];
            require(collection.maxSupply > 0 || collection.maxSupply == 0, "Collection does not exist");
            
            // Check if there is a maxSupply and enforce it
            if (collection.maxSupply > 0) {
                require(collection.totalMinted + amount <= collection.maxSupply, "Exceeds max supply");
            }

            collection.totalMinted += amount;
        }

        _mintBatch(to, ids, amounts, data);
    }

    // Function to set trusted remote addresses for cross-chain communication.
    function setTrustedRemote(string calldata chain, string calldata remoteAddress) external onlyOwner {
        trustedRemotes[chain] = remoteAddress;
    }

    // Function to initiate a cross-chain transfer of tokens.
    function crossChainTransfer(
        string calldata destinationChain,
        address destinationAddress,
        uint256 id,
        uint256 amount,
        bytes calldata data
    ) external payable {
        require(balanceOf(msg.sender, id) >= amount, "Insufficient balance");
        require(bytes(trustedRemotes[destinationChain]).length > 0, "Destination chain not trusted");

        // Burn the tokens on the source chain
        _burn(msg.sender, id, amount);

        // Encode the payload for cross-chain transfer
        bytes memory payload = abi.encode(destinationAddress, id, amount, data);

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

        emit CrossChainTransferInitiated(msg.sender, destinationChain, destinationAddress, id, amount);
    }

    // Internal function that is called when a cross-chain message is received.
    function _execute(
        string calldata sourceChain,
        string calldata sourceAddress,
        bytes calldata payload
    ) internal override {
        require(keccak256(bytes(sourceAddress)) == keccak256(bytes(trustedRemotes[sourceChain])), "Not a trusted source");

        // Decode the payload to retrieve transfer details
        (address recipient, uint256 id, uint256 amount, bytes memory data) = abi.decode(payload, (address, uint256, uint256, bytes));

        // Mint the tokens on the destination chain
        _mint(recipient, id, amount, data);

        emit CrossChainTransferExecuted(sourceChain, sourceAddress, recipient, id, amount);
    }

    // The following functions are overrides required by Solidity.
    function _update(address from, address to, uint256[] memory ids, uint256[] memory amounts) 
        internal 
        override(ERC1155, ERC1155Supply) 
    {
        super._update(from, to, ids, amounts);
    }
}
