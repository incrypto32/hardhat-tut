//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "hardhat/console.sol";
import "./AuctionBase.sol";

contract BidContract is AuctionBase {
    event BidPlaced(uint256 tokenId, address by, uint256 value);
    modifier bidRequirements(uint256 _tokenId) {
        AuctionItem storage item = itemsList[_tokenId];

        require(
            _tokenPresentInAuction(_tokenId),
            "BidContract : token is not currently in auction"
        );

        require(!item.soldOut, "BidContract : item sold out");
        require(
            msg.value >= item.basePrice,
            "BidContract : value sent must be greater than base price"
        );
        require(
            msg.value >= item.bid.amount,
            "BidContract : value sent must be greater than previous bid"
        );

        _;
    }

    function _createNewBid(AuctionItem storage item) private whenNotPaused {
        item.bid = Bid(msg.value, msg.sender);
    }

    function _settlePreviousBid(AuctionItem storage item)
        private
        whenNotPaused
    {
        payable(item.bid.bidder).transfer(item.bid.amount);
    }

    function bid(uint256 _tokenId)
        public
        payable
        whenNotPaused
        auctionRunning
        bidRequirements(_tokenId)
    {
        AuctionItem storage item = itemsList[_tokenId];

        if (msg.value >= item.directBuyPrice) {
            item.soldOut = true;
        }

        // TODO : Transfer money to previous bidder
        _settlePreviousBid(item);
        _createNewBid(item);
        emit BidPlaced(_tokenId, msg.sender, msg.value);
    }

    // function to check whether token is in current aution
    function _tokenPresentInAuction(uint256 _tokenId)
        private
        view
        auctionRunning
        returns (bool)
    {
        uint256[] storage currentlyInAuction = auctionItems[auctionId];

        for (uint256 index = 0; index < currentlyInAuction.length; index++) {
            if (currentlyInAuction[index] == _tokenId) {
                return true;
            }
        }

        return false;
    }
}
