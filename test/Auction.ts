import { AuctionWrapper } from './../typechain/AuctionWrapper.d'
import '@nomiclabs/hardhat-ethers'
import '@nomiclabs/hardhat-waffle'
import { ethers } from 'hardhat'
import { expect } from 'chai'
import { beforeEach, describe } from 'mocha'
import { Contract, ContractFactory } from '@ethersproject/contracts'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'

describe('AuctionWrapper', function () {
  let auction: AuctionWrapper
  let tokenIds = [1, 2, 3, 4, 5]
  let basePrice = ethers.utils.parseEther('0.01')
  let directBuyPrice = ethers.utils.parseEther('1')
  let testAmount = ethers.utils.parseEther('0.1')
  let endTime = Math.round(
    new Date(new Date().getTime() + 10 * 60000).getTime() / 1000,
  ).toString()
  let signers: SignerWithAddress[]
  let owner: SignerWithAddress
  let addr1: SignerWithAddress

  before(async () => {
    console.log('Running before hook')
    signers = await ethers.getSigners()
    owner = signers[0]
    addr1 = signers[1]
    let AuctionContract = await ethers.getContractFactory('AuctionWrapper')
    auction = (await AuctionContract.deploy()) as AuctionWrapper
    await auction.deployed()
  })

  describe('Auction', () => {
    it('Create new auction', async function () {
      await (
        await auction.createNewAuction(
          tokenIds,
          basePrice,
          directBuyPrice,
          endTime,
        )
      )
        .wait()
        .catch((e) => {
          console.log(e)
          expect(false).to.equal(true, 'Auction creation failed')
        })

      expect(await auction.nOfBidItems()).to.be.equal(tokenIds.length)
      expect(await auction.auctionId()).to.be.equal(1)
      expect(await auction.endTime()).to.be.equal(endTime)
      expect(await auction.paused()).to.be.equal(false)
      expect(await auction.auctionItems(1, 0)).to.be.equal(1)
      expect(await auction.auctionItems(1, 1)).to.be.equal(2)
      expect(await auction.auctionItems(1, 2)).to.be.equal(3)
      expect(await auction.auctionItems(1, 3)).to.be.equal(4)
      expect(await auction.auctionItems(1, 4)).to.be.equal(5)
      await expect(auction.auctionItems(1, 5)).to.be.reverted
    })

    it('Should revert if caller is not owner', async () => {
      await expect(
        auction
          .connect(addr1)
          .createNewAuction(tokenIds, basePrice, directBuyPrice, endTime),
      ).to.be.revertedWith('Ownable: caller is not the owner')
    })

    it('Should revert if another auction is already running', async () => {
      await expect(
        auction.createNewAuction(tokenIds, basePrice, directBuyPrice, endTime),
      ).to.be.revertedWith('AuctionBase : another auction running')
    })
  })

  describe('Bid', () => {
    it('Create new bid', async function () {
      await (
        await auction.connect(addr1).bid(tokenIds[0], { value: testAmount })
      ).wait()

      let auctionItem = await auction.itemsList(tokenIds[0])
      expect(auctionItem.basePrice).to.be.equal(basePrice)
      expect(auctionItem.directBuyPrice).to.be.equal(directBuyPrice)
      expect(auctionItem.soldOut).to.be.equal(false)
      expect(auctionItem.bid.bidder).to.be.equal(addr1.address)
      expect(auctionItem.bid.amount).to.be.equal(testAmount)
    })

    it('Should revert if token is currently not in auction', async function () {
      await expect(
        auction.connect(addr1).bid(10, { value: basePrice.sub(10) }),
      ).to.be.revertedWith('BidContract : token is not currently in auction')
    })

    it('Should revert if bid is less than previous bid', async function () {
      await expect(
        auction.connect(addr1).bid(tokenIds[0], { value: basePrice.sub(10) }),
      ).to.be.revertedWith(
        'BidContract : value sent must be greater than base price',
      )
    })

    it('Should revert if bid is less than previous bid', async function () {
      await expect(
        auction.connect(addr1).bid(tokenIds[0], { value: basePrice.add(10) }),
      ).to.be.revertedWith(
        'BidContract : value sent must be greater than previous bid',
      )
    })

    it('Should be sold out if the bid is above directBuyPrice', async function () {
      await (
        await auction
          .connect(addr1)
          .bid(tokenIds[0], { value: directBuyPrice.add(10) })
      ).wait()

      let auctionItem = await auction.itemsList(tokenIds[0])
      expect(auctionItem.soldOut).to.be.equal(true)
      expect(auctionItem.bid.bidder).to.be.equal(addr1.address)
      expect(auctionItem.bid.amount).to.be.equal(directBuyPrice.add(10))
    })

    it('Cannot bid if sold out', async function () {
      await expect(
        auction
          .connect(addr1)
          .bid(tokenIds[0], { value: directBuyPrice.add(100) }),
      ).to.be.revertedWith('BidContract : item sold out')
    })
  })
})
