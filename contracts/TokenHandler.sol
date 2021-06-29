//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "hardhat/console.sol";
import "./Claim.sol";

contract TokenHandler is AuctionBase {
    function createToken(string memory _tokenURI) public onlyOwner {
        token.createToken(_tokenURI);
    }
}
