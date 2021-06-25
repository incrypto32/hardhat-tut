//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "hardhat/console.sol";

contract Auction is Ownable {
    using SafeMath for uint256;

    uint256 public nOfBidItems;
    uint256 auctionId = 1;
    uint256 endTime;
    bool paused = false;

    // A Single Bid on a particular token
    struct Bid {
        uint256 amount;
        address bidder;
    }

    // A token wrapped for adding auction varibales
    struct AuctionItem {
        uint256 basePrice;
        uint256 directBuyPrice;
        bool soldOut;
        Bid bid;
    }

    mapping(uint256 => uint256[]) auctionItems;
    mapping(uint256 => AuctionItem) itemsList;

    modifier whenNotPaused {
        require(!paused, "This functionalit is paused temporarily");
        _;
    }

    modifier auctionRunning {
        require(
            block.timestamp < endTime,
            "This functionalit is paused temporarily"
        );
        _;
    }

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

    // Create a new auction
    function createNewAuction(
        uint256[] memory _tokenIds,
        uint256 _basePrice,
        uint256 _directBuyPrice,
        uint256 _endTime
    ) public whenNotPaused onlyOwner() {
        require(_tokenIds.length > 0, "Empty array");

        // curremt AuctionItems
        auctionItems[auctionId] = _tokenIds;

        for (uint256 index = 0; index < _tokenIds.length; index++) {
            uint256 _currentTokenID = _tokenIds[index];

            // Create Auction Items
            itemsList[_currentTokenID] = AuctionItem(
                _basePrice,
                _directBuyPrice,
                false,
                Bid(0, address(0))
            );
        }

        // increase the auction ID and set the end time of the current auction
        auctionId++;
        endTime = _endTime;
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

    function claimToken() public {}
}
