//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "hardhat/console.sol";
import "./Auction.sol";

contract BidContract is Auction {
    using SafeMath for uint256;

  

    modifier bidRequirements(uint256 _tokenId) {
        AuctionItem storage item = itemsList[_tokenId];

        require(
            _tokenPresentInAuction(_tokenId),
            "token is not currently in auction"
        );
        require(!item.soldOut, "item sold out");
        require(
            msg.value >= item.basePrice,
            "value sent must be greater than base price"
        );
        require(
            msg.value >= item.bid.amount,
            "value sent must be greater than previous bid"
        );

        _;
    }

   
 

    function _createNewBid(AuctionItem storage item) private whenNotPaused {
        item.bid = Bid(msg.value, msg.sender);
    }

    function bid(uint256 _tokenId)
        public
        payable
        whenNotPaused
        bidRequirements(_tokenId)
    {
        AuctionItem storage item = itemsList[_tokenId];

        if (msg.value >= item.directBuyPrice) {
            item.soldOut = true;
        }

        _createNewBid(item);
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

    function claimToken(uint256 _tokenId) public claimRequirements(_tokenId) {
        
    }
}
