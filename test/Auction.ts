import { AuctionWrapper } from "./../typechain/AuctionWrapper.d";
import "@nomiclabs/hardhat-ethers";
import "@nomiclabs/hardhat-waffle";
import { ethers } from "hardhat";
import { expect } from "chai";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { VocabStorToken } from "../typechain/VocabStorToken";

async function mintTokens(token: AuctionWrapper) {
  await token.createToken("http://a.com");
  await token.createToken("http://b.com");
  await token.createToken("http://c.com");
  await token.createToken("http://d.com");
  await token.createToken("http://e.com");
}

describe("AuctionWrapper", function () {
  let token: VocabStorToken;
  let auction: AuctionWrapper;
  let tokenIds = [1, 2, 3, 4, 5];
  let basePrice = ethers.utils.parseEther("0.01");
  let directBuyPrice = ethers.utils.parseEther("1");
  let testAmount = ethers.utils.parseEther("0.1");
  let signers: SignerWithAddress[];
  let owner: SignerWithAddress;
  let addr1: SignerWithAddress;

  before(async () => {
    console.log("Running before hook");
    signers = await ethers.getSigners();
    owner = signers[0];
    addr1 = signers[1];
    let VocabStorToken = await ethers.getContractFactory("VocabStorToken");
    token = (await VocabStorToken.deploy()) as VocabStorToken;

    let AuctionContract = await ethers.getContractFactory("AuctionWrapper");
    auction = (await AuctionContract.deploy(token.address)) as AuctionWrapper;
    await token.transferOwnership(auction.address);
    await mintTokens(auction);
  });

  describe("Deployment", () => {
    it("Should return the correct token address", async () => {
      expect(await auction.token()).to.be.equal(token.address);
    });
    it("Should return the false for paused", async () => {
      expect(await auction.paused()).to.be.equal(false);
    });
    it("Should return auctionId = 0", async () => {
      expect(await auction.auctionId()).to.be.equal(0);
    });
  });

  describe("Auction", () => {
    it("Create new auction", async function () {
      await auction.createNewAuction(tokenIds, basePrice, directBuyPrice);

      expect(await auction.auctionId()).to.be.equal(1);

      expect(await auction.paused()).to.be.equal(false);
      expect(await auction.auctionItems(1, 0)).to.be.equal(1);
      expect(await auction.auctionItems(1, 1)).to.be.equal(2);
      expect(await auction.auctionItems(1, 2)).to.be.equal(3);
      expect(await auction.auctionItems(1, 3)).to.be.equal(4);
      expect(await auction.auctionItems(1, 4)).to.be.equal(5);
      await expect(auction.auctionItems(1, 5)).to.be.reverted;
    });

    it("Should revert if caller is not owner", async () => {
      await expect(
        auction
          .connect(addr1)
          .createNewAuction(tokenIds, basePrice, directBuyPrice)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("Should revert if another auction is already running", async () => {
      await expect(
        auction.createNewAuction(tokenIds, basePrice, directBuyPrice)
      ).to.be.revertedWith(
        "AuctionBase : another auction is active at the moment"
      );
    });
  });

  describe("Bid", () => {
    it("Create new bid", async function () {
      await auction.connect(addr1).bid(tokenIds[0], { value: testAmount });

      let auctionItem = await auction.itemsList(tokenIds[0]);
      expect(auctionItem.basePrice).to.be.equal(basePrice);
      expect(auctionItem.directBuyPrice).to.be.equal(directBuyPrice);
      expect(auctionItem.soldOut).to.be.equal(false);
      expect(auctionItem.bid.bidder).to.be.equal(addr1.address);
      expect(auctionItem.bid.amount).to.be.equal(testAmount);
    });

    it("Should revert if token is currently not in auction", async function () {
      await expect(
        auction.connect(addr1).bid(10, { value: basePrice.sub(10) })
      ).to.be.revertedWith("BidContract : token is not currently in auction");
    });

    it("Should revert if bid is less than base price", async function () {
      await expect(
        auction.connect(addr1).bid(tokenIds[0], { value: basePrice.sub(10) })
      ).to.be.revertedWith(
        "BidContract : value sent must be greater than base price"
      );
    });

    it("Should revert if bid is less than previous bid", async function () {
      await expect(
        auction.connect(addr1).bid(tokenIds[0], { value: basePrice.add(10) })
      ).to.be.revertedWith(
        "BidContract : value sent must be greater than previous bid"
      );
    });

    it("Balance of previous bidder should increase if a new bidder bids", async function () {
      let prevBalance = await addr1.getBalance();

      await auction.bid(tokenIds[0], { value: testAmount.add(10) });

      let balance = await addr1.getBalance();

      expect(balance).to.be.equal(prevBalance.add(testAmount));
    });

    it("Should emit BidPlaced event when a bid is placed", async () => {
      await expect(
        auction
          .connect(addr1)
          .bid(tokenIds[0], { value: directBuyPrice.add(10) })
      )
        .to.emit(auction, "BidPlaced")
        .withArgs(tokenIds[0], addr1.address, directBuyPrice.add(10));
    });

    it("Should be sold out if the bid is above directBuyPrice", async function () {
      let auctionItem = await auction.itemsList(tokenIds[0]);
      expect(auctionItem.soldOut).to.be.equal(true);
      expect(auctionItem.bid.bidder).to.be.equal(addr1.address);
      expect(auctionItem.bid.amount).to.be.equal(directBuyPrice.add(10));
    });

    it("Cannot bid if sold out", async function () {
      await expect(
        auction
          .connect(addr1)
          .bid(tokenIds[0], { value: directBuyPrice.add(100) })
      ).to.be.revertedWith("BidContract : item sold out");
    });
  });

  describe("Claim", () => {
    it("Should be reverted if not the owner", async () => {
      await expect(auction.claimToken(tokenIds[0])).to.be.revertedWith(
        "Claim : an auction is still running"
      );
    });

    it("End Auction", async () => {
      await auction.endAuction();
      let auctionStatus = await auction.auctionDetails(
        await auction.auctionId()
      );
      expect(auctionStatus.nOfBidItems).to.be.equal(tokenIds.length);
      expect(auctionStatus.status).to.be.equal(0);
    });

    it("Should be reverted if not the owner", async () => {
      await expect(auction.claimToken(tokenIds[0])).to.be.revertedWith(
        "Claim : not authorized"
      );
    });

    it("Owner of the token should be the contract", async () => {
      expect(await token.ownerOf(tokenIds[0])).to.be.equal(auction.address);
    });

    it("Should emit TokenClaimed event", async () => {
      await expect(auction.connect(addr1).claimToken(tokenIds[0]))
        .to.emit(auction, "TokenClaimed")
        .withArgs(tokenIds[0], addr1.address);
    });

    it("Owner should change", async () => {
      expect(await token.ownerOf(tokenIds[0])).to.be.not.equal(owner.address);
      expect(await token.ownerOf(tokenIds[0])).to.be.equal(addr1.address);
    });
  });
});
