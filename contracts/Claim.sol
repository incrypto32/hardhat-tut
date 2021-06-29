//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "hardhat/console.sol";
import "./BidContract.sol";

contract Claim is BidContract {
    event TokenClaimed(uint256 tokenId, address by);

    modifier claimRequirements(uint256 _tokenId) {
        AuctionItem storage item = itemsList[_tokenId];

        require(!_auctionRunning(), "Claim : an auction is still running");

        require(item.bid.bidder == msg.sender, "Claim : not authorized");

        _;
    }

    function claimToken(uint256 _tokenId) public claimRequirements(_tokenId) {
        emit TokenClaimed(_tokenId, msg.sender);
    }
}
