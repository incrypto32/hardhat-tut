import { VocabStorToken } from '../typechain/VocabStorToken'
import '@nomiclabs/hardhat-ethers'
import '@nomiclabs/hardhat-waffle'
import { ethers } from 'hardhat'
import { expect } from 'chai'
import { beforeEach, describe } from 'mocha'
import { Contract, ContractFactory } from '@ethersproject/contracts'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'

describe('VocabStorToken', function () {
  let VocabStorToken: ContractFactory
  let token: VocabStorToken
  let signers: SignerWithAddress[]
  let owner: SignerWithAddress
  const tokenWord = 'FCUK'
  const tokenURI = 'http://google.com/fcuk'

  beforeEach(async () => {
    signers = await ethers.getSigners()
    owner = signers[0]
    VocabStorToken = await ethers.getContractFactory('VocabStorToken')
    token = (await VocabStorToken.deploy()) as VocabStorToken
    await token.deployed()
  })

  it('Should return currect token Name and token Symbol', async function () {
    expect(await token.name()).to.equal('VocabStorToken')
    expect(await token.symbol()).to.equal('VCBT')
  })

  it('Mint Tokens', async function () {
    await (await token.createToken( tokenURI)).wait()

    // After minting the account should have the right number of tokens
    expect(await token.tokenCounter()).to.be.equal(1)
    expect(await token.balanceOf(owner.address)).to.be.equal(1)
    expect(await token.ownerOf(0)).to.be.equal(owner.address)
    expect(await token.tokenURI(0)).to.be.equal(tokenURI)

    // expect(await token.tokenURI(0))
  })
})
