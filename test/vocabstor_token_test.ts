import '@nomiclabs/hardhat-ethers'
import '@nomiclabs/hardhat-waffle'
import { ethers } from 'hardhat'
import { expect } from 'chai'
import { beforeEach, describe } from 'mocha'
import { Contract, ContractFactory } from '@ethersproject/contracts'

describe('Greeter', function () {
  let VocabstorToken: ContractFactory
  let token: Contract

  beforeEach(async () => {
    VocabstorToken = await ethers.getContractFactory('Greeter')
    token = await VocabstorToken.deploy('Hello, world!')
    await token.deployed()
  })

  it("Should return currect token Name", async function () {
    
  })
})
