//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "hardhat/console.sol";

contract AuctionBase is Ownable {
    using SafeMath for uint256;

    uint256 public auctionId = 0;
    bool public paused = false;

    enum AuctionStatus {
        ENDED,
        ACTIVE,
        PAUSED
    }

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

    struct AuctionDetails {
        uint256 nOfBidItems;
        AuctionStatus status;
    }

    mapping(uint256 => uint256[]) public auctionItems;
    mapping(uint256 => AuctionDetails) public auctionDetails;
    mapping(uint256 => AuctionItem) public itemsList;

    event AuctionEnded(uint256 id);
    event AuctionPaused(uint256 id);
    event AuctionUnPaused(uint256 id);
    event AuctionBegin(uint256 id);

    modifier whenNotPaused {
        require(!paused, "This functionalit is paused temporarily");
        _;
    }

    modifier auctionRunning {
        require(
            _auctionRunning(),
            "AuctionBase : no auctions are active at the moment"
        );
        _;
    }

    modifier auctionNotRunning {
        require(
            !_auctionRunning(),
            "AuctionBase : another auction is active at the moment"
        );
        _;
    }

    function _auctionRunning() internal view returns (bool) {
        return !(auctionDetails[auctionId].status == AuctionStatus.ENDED);
    }

    // Create a new auction
    function createNewAuction(
        uint256[] memory _tokenIds,
        uint256 _basePrice,
        uint256 _directBuyPrice
    ) public whenNotPaused onlyOwner auctionNotRunning {
        require(_tokenIds.length > 0, "Empty array");
        // Begin creating new auction
        auctionId++;
        auctionDetails[auctionId] = AuctionDetails(
            _tokenIds.length,
            AuctionStatus.ACTIVE
        );
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

        emit AuctionBegin(auctionId);
    }

    function endAuction() public onlyOwner {
        auctionDetails[auctionId].status = AuctionStatus.ENDED;
        emit AuctionEnded(auctionId);
    }

    function pauseAuction() public onlyOwner {
        auctionDetails[auctionId].status = AuctionStatus.PAUSED;
        emit AuctionPaused(auctionId);
    }

    function unPauseAuction() public onlyOwner {
        auctionDetails[auctionId].status = AuctionStatus.PAUSED;
        emit AuctionUnPaused(auctionId);
    }

    function pause() public onlyOwner {
        paused = true;
    }

    function unPause() public onlyOwner {
        paused = false;
    }
}
