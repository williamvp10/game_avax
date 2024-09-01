// SPDX-License-Identifier: MIT
// Compatible with OpenZeppelin Contracts ^5.0.0
pragma solidity >=0.8.0 <0.9.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";

contract Token is ERC20, ERC20Burnable, Ownable, ERC20Permit {

    constructor(string memory _name, string memory _symbol, uint256 _initialSupply, address _initialOwner) 
        ERC20(_name, _symbol) 
        Ownable(_initialOwner)
        ERC20Permit(_name){
        require(_initialOwner != address(0), "Owner address cannot be zero");
        _mint(msg.sender, _initialSupply * (10 ** decimals()));
    }

    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }
}