// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import { AxelarExecutable } from "@axelar-network/axelar-gmp-sdk-solidity/contracts/executable/AxelarExecutable.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@axelar-network/axelar-gmp-sdk-solidity/contracts/interfaces/IAxelarGateway.sol";
import "@axelar-network/axelar-gmp-sdk-solidity/contracts/interfaces/IAxelarGasService.sol";

contract CrossChainNFT721 is ERC721, ERC721URIStorage,AxelarExecutable {
    
    IAxelarGasService public immutable gasService;
    string public message;
    string public sourceChain;
    string public sourceAddress;

    event Executed(string _from, string _message);

    uint256 private _tokenIds;
    mapping(string => string) public trustedRemotes;

    /**
     * @dev Constructor that initializes the contract with the Axelar Gateway and Gas Service addresses.
     * @param _gateway The address of the Axelar Gateway contract.
     * @param _gasService The address of the Axelar Gas Service contract.
     */
    constructor(string memory _name, string memory _symbol, address _gateway, address _gasService ) 
    ERC721(_name, _symbol) AxelarExecutable(_gateway) {
        gasService = IAxelarGasService(_gasService);
    }

    /**
     * @dev Function to set trusted remote addresses for cross-chain communication.
     * @param _chain The chain for which the trusted remote address is being set.
     * @param _address The trusted remote address for the specified chain.
     */
    function setTrustedRemote(string calldata _chain, string calldata _address) external {
        trustedRemotes[_chain] = _address;
    }

    /**
     * @dev Function to mint a new NFT.
     * @param _tokenURI The URI of the metadata associated with the new NFT.
     * @return The ID of the newly minted NFT.
     */
    function mint(string memory _tokenURI) external returns (uint256) {
        uint256 newTokenId = _tokenIds++;
        _safeMint(msg.sender, newTokenId);
        _setTokenURI(newTokenId, _tokenURI);
        return newTokenId;
    }

    /**
     * @dev Internal function to check if the provided initiator address is the owner of the NFT with the specified tokenId.
     * @param initiator The address that is attempting to interact with the NFT.
     * @param tokenId The ID of the NFT.
     * @return true if the initiator is the owner of the NFT, false otherwise.
     */
    function _isApprovedOrOwner(address initiator,uint256 tokenId) internal view returns (bool) {
        if(ownerOf(tokenId)==initiator){
            return true;
        }
        else{
            return false;
        }
    }

    /**
     * @dev Function to initiate a cross-chain transfer of an NFT.
     * @param destinationChain The chain to which the NFT will be transferred.
     * @param destinationAddress The address on the destination chain where the NFT will be received.
     * @param tokenId The ID of the NFT being transferred.
     */
    function crossChainTransfer(
        string calldata destinationChain,
        address destinationAddress,
        uint256 tokenId
    ) external payable {
        require(_isApprovedOrOwner(_msgSender(), tokenId), "Not approved or owner");
        require(bytes(trustedRemotes[destinationChain]).length > 0, "Destination chain not trusted");

        string memory _tokenURI = tokenURI(tokenId);

        _burn(tokenId);

        bytes memory payload = abi.encode(destinationAddress, tokenId, _tokenURI);

        if (msg.value > 0) {
            gasService.payNativeGasForContractCall{value: msg.value}(
                address(this),
                destinationChain,
                trustedRemotes[destinationChain],
                payload,
                msg.sender
            );
        }

        gateway.callContract(destinationChain, trustedRemotes[destinationChain], payload);
    }

    /**
     * @dev Internal function that is called when a cross-chain message is received.
     * @param _sourceChain The chain from which the message originated.
     * @param _sourceAddress The address on the source chain that initiated the cross-chain transfer.
     * @param _payload The encoded data containing the destination address, token ID, and token URI.
     */
    function _execute(
        string calldata _sourceChain,
        string calldata _sourceAddress,
        bytes calldata _payload
    ) internal override  {
        require(keccak256(bytes(sourceAddress)) == keccak256(bytes(trustedRemotes[_sourceChain])), "Not a trusted source");

        sourceChain=_sourceChain;
        sourceAddress = _sourceAddress;
        
        (address to, uint256 tokenId, string memory _tokenURI) = abi.decode(_payload, (address, uint256, string));

        _safeMint(to, tokenId);
        _setTokenURI(tokenId, _tokenURI);
    }

    /**
     * @dev Override function to return the token URI associated with the specified tokenId.
     * @param tokenId The ID of the NFT.
     * @return The token URI of the NFT.
     */
    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }

    /**
     * @dev Override function to handle the interface ID functionality.
     * @param interfaceId The interface ID to check.
     * @return true if the contract supports the specified interface, false otherwise.
     */
    function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC721URIStorage) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}