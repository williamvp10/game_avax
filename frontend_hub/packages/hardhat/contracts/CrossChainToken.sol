// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import { AxelarExecutable } from "@axelar-network/axelar-gmp-sdk-solidity/contracts/executable/AxelarExecutable.sol";
import "@axelar-network/axelar-gmp-sdk-solidity/contracts/interfaces/IAxelarGateway.sol";
import "@axelar-network/axelar-gmp-sdk-solidity/contracts/interfaces/IAxelarGasService.sol";

contract CrossChainToken is ERC20, ERC20Burnable, Ownable, ERC20Permit, AxelarExecutable {

    IAxelarGasService public immutable gasService;
    mapping(string => string) public trustedRemotes;

    event CrossChainTransferInitiated(address indexed sender, string destinationChain, address destinationAddress, uint256 amount);
    event CrossChainTransferExecuted(string sourceChain, string sourceAddress, address recipient, uint256 amount);

    /**
     * @dev Constructor that initializes the contract with the Axelar Gateway and Gas Service addresses.
     * @param _name The name of the token.
     * @param _symbol The symbol of the token.
     * @param _initialSupply The initial supply of the token.
     * @param _initialOwner The owner of the contract.
     * @param _gateway The address of the Axelar Gateway contract.
     * @param _gasService The address of the Axelar Gas Service contract.
     */
    constructor(
        string memory _name, 
        string memory _symbol, 
        uint256 _initialSupply, 
        address _initialOwner,
        address _gateway,
        address _gasService
    ) 
        ERC20(_name, _symbol) 
        Ownable(_initialOwner)
        ERC20Permit(_name)
        AxelarExecutable(_gateway) 
    {
        require(_initialOwner != address(0), "Owner address cannot be zero");
        _mint(_initialOwner, _initialSupply * (10 ** decimals()));
        gasService = IAxelarGasService(_gasService);
    }

    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }

    /**
     * @dev Function to set trusted remote addresses for cross-chain communication.
     * @param chain The chain for which the trusted remote address is being set.
     * @param remoteAddress The trusted remote address for the specified chain.
     */
    function setTrustedRemote(string calldata chain, string calldata remoteAddress) external onlyOwner {
        trustedRemotes[chain] = remoteAddress;
    }

    /**
     * @dev Function to initiate a cross-chain transfer of tokens.
     * @param destinationChain The chain to which the tokens will be transferred.
     * @param destinationAddress The address on the destination chain where the tokens will be received.
     * @param amount The amount of tokens being transferred.
     */
    function sendTokensCrossChain(
        string calldata destinationChain,
        address destinationAddress,
        uint256 amount
    ) external payable {
        require(amount > 0, "Amount must be greater than zero");
        require(balanceOf(msg.sender) >= amount, "Insufficient balance");
        require(bytes(trustedRemotes[destinationChain]).length > 0, "Destination chain not trusted");

        // Quemar los tokens en la cadena de origen
        _burn(msg.sender, amount);

        // Codificar el payload que será enviado a la cadena destino
        bytes memory payload = abi.encode(destinationAddress, amount);

        // Pagar el gas necesario para el envío cross-chain
        if (msg.value > 0) {
            gasService.payNativeGasForContractCall{value: msg.value}(
                address(this),
                destinationChain,
                trustedRemotes[destinationChain],
                payload,
                msg.sender
            );
        }

        // Enviar el mensaje cross-chain a través de Axelar
        gateway.callContract(destinationChain, trustedRemotes[destinationChain], payload);

        emit CrossChainTransferInitiated(msg.sender, destinationChain, destinationAddress, amount);
    }

    /**
     * @dev Internal function that is called when a cross-chain message is received.
     * @param sourceChain The chain from which the message originated.
     * @param sourceAddress The address on the source chain that initiated the cross-chain transfer.
     * @param payload The encoded data containing the destination address and token amount.
     */
    function _execute(
        string calldata sourceChain,
        string calldata sourceAddress,
        bytes calldata payload
    ) internal override {
        require(keccak256(bytes(sourceAddress)) == keccak256(bytes(trustedRemotes[sourceChain])), "Not a trusted source");

        // Decodificar el payload para obtener la cantidad de tokens y la dirección de destino
        (address recipient, uint256 amount) = abi.decode(payload, (address, uint256));

        // Mint tokens en la cadena de destino
        _mint(recipient, amount);

        emit CrossChainTransferExecuted(sourceChain, sourceAddress, recipient, amount);
    }
}
