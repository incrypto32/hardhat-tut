//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract VocabStorToken is ERC721URIStorage, Ownable {
    using SafeMath for uint256;
    uint256 public tokenCounter;

    constructor() ERC721("VocabStorToken", "VCBT") {
        tokenCounter = 0;
    }

    function createToken(string memory _tokenURI)
        public
        onlyOwner
        returns (uint256)
    {
        uint256 newTokenId = tokenCounter;
        _mint(msg.sender, newTokenId);
        _setTokenURI(newTokenId, _tokenURI);
        tokenCounter += 1;
        return newTokenId;
    }
}
