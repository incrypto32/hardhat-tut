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

        require(
            block.timestamp >= endTime,
            "token is not currently in auction"
        );
        require(
            item.bid.bidder == msg.sender,
            "value sent must be greater than previous bid"
        );
        require(
            item.bid.amount >= item.basePrice,
            "value sent must be greater than base price"
        );

        _;
    }

    function claimToken(uint256 _tokenId) public claimRequirements(_tokenId) {
        console.log("TOKEN CLAIMED : ", _tokenId, msg.sender);
        emit TokenClaimed(_tokenId, msg.sender);
    }
}
