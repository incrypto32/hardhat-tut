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
  let endTime = Math.round(
    new Date(new Date().getTime() + 10 * 60000).getTime() / 1000,
  ).toString()

  before(async () => {
    console.log('Running before hook')
    let AuctionContract = await ethers.getContractFactory('AuctionWrapper')
    auction = (await AuctionContract.deploy()) as AuctionWrapper
    await auction.deployed()
    await (
      await auction.createNewAuction(
        tokenIds,
        basePrice,
        directBuyPrice,
        endTime,
      )
    ).wait()
  })

  it('Create new auction', async function () {
    
  })

  it('Auction values check', async function () {
    expect(await auction.nOfBidItems()).to.be.equal(tokenIds.length)
    expect(await auction.auctionId()).to.be.equal(1)
    expect(await auction.endTime()).to.be.equal(endTime)
    expect(await auction.paused()).to.be.equal(false)
  })
})
