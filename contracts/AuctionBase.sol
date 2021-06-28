//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "hardhat/console.sol";

contract AuctionBase is Ownable {
    using SafeMath for uint256;

    uint256 public nOfBidItems;
    uint256 public auctionId = 0;
    uint256 public endTime;
    bool public paused = false;

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

    mapping(uint256 => uint256[]) public auctionItems;
    mapping(uint256 => AuctionItem) public itemsList;

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

    // Create a new auction
    function createNewAuction(
        uint256[] memory _tokenIds,
        uint256 _basePrice,
        uint256 _directBuyPrice,
        uint256 _endTime
    ) public whenNotPaused onlyOwner {
        require(_tokenIds.length > 0, "Empty array");
        require(block.timestamp > endTime,"AuctionBase : another auction running");

        nOfBidItems = _tokenIds.length;

        auctionId++;
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

        endTime = _endTime;
    }

    function printData() public view {
        console.log("_____HERE YOU GO_____");
        console.log(nOfBidItems);
        console.log(auctionId);
        console.log(endTime);
        console.log(paused);
        console.log("______________________");
    }
}
