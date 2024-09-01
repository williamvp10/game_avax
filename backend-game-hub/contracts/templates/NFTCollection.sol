// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Supply.sol";

contract NFTCollection is ERC1155, Ownable, ERC1155Supply {
    string public name;
    string public symbol;

    struct Collection {
        uint256 maxSupply; // 0 indicates no max supply
        uint256 totalMinted;
    }

    mapping(uint256 => Collection) public collections;

    event CollectionCreated(uint256 indexed id, uint256 maxSupply);
    event TokenMinted(uint256 indexed id, address indexed account, uint256 amount);

    constructor(string memory _name, string memory _symbol, address _initialOwner, string memory _initialURI) 
        ERC1155(_initialURI) 
        Ownable(_initialOwner) 
    {
        name = _name;
        symbol = _symbol;
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

    // The following functions are overrides required by Solidity.
    function _update(address from, address to, uint256[] memory ids, uint256[] memory amounts) 
        internal 
        override(ERC1155, ERC1155Supply) 
    {
        super._update(from, to, ids, amounts);
    }
}
