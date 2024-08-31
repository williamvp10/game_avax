// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import "@axelar-network/axelar-gmp-sdk-solidity/contracts/interfaces/IAxelarGateway.sol";
import "@axelar-network/axelar-gmp-sdk-solidity/contracts/interfaces/IAxelarExecutable.sol";

abstract contract InterchainToken is ERC20, ERC20Burnable, Ownable, ERC20Permit, IAxelarExecutable {
    IAxelarGateway public gateway;

    event SentToChain(string indexed destinationChain, string indexed destinationAddress, uint256 amount);
    event ReceivedFromChain(string indexed sourceChain, string indexed sourceAddress, uint256 amount);

    constructor(
        string memory name,
        string memory symbol,
        uint256 initialSupply,
        address initialOwner,
        address gatewayAddress
    ) 
        ERC20(name, symbol) 
        Ownable(initialOwner)
        ERC20Permit(name)
        IAxelarExecutable()
    {
        require(initialOwner != address(0), "Owner address cannot be zero");
        require(gatewayAddress != address(0), "Gateway address cannot be zero");
        gateway = IAxelarGateway(gatewayAddress);
        _mint(msg.sender, initialSupply * (10 ** decimals()));
    }

    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }

    function sendToChain(string memory destinationChain, string memory destinationAddress, uint256 amount) external {
        _burn(msg.sender, amount);
        bytes memory payload = abi.encode(destinationAddress, amount);
        gateway.callContract(destinationChain, destinationAddress, payload);
        emit SentToChain(destinationChain, destinationAddress, amount);
    }

    function _execute(string calldata sourceChain, string calldata sourceAddress, bytes calldata payload) internal {
        (address recipient, uint256 amount) = abi.decode(payload, (address, uint256));
        _mint(recipient, amount);
        emit ReceivedFromChain(sourceChain, sourceAddress, amount);
    }

    function executeCall(
        string calldata sourceChain,
        string calldata sourceAddress,
        bytes calldata payload
    ) external {
        _execute(sourceChain, sourceAddress, payload);
    }
}
