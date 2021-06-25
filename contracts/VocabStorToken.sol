//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

contract VocabStorToken is ERC721URIStorage {
    uint256 public tokenCounter;

    constructor() ERC721("VocabStorToken", "VCBT") {
        tokenCounter = 0;
    }

    function createToken(string memory _tokenData, string memory _tokenURI)
        public
        returns (uint256)
    {
        
        uint256 newTokenId = tokenCounter;
        _safeMint(msg.sender, newTokenId, 
        
        bytes(_tokenData));
        _setTokenURI(newTokenId, 
        _tokenURI);
        tokenCounter += 
        1;
        return newTokenId;
    }
}
