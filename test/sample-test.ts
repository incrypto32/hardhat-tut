import '@nomiclabs/hardhat-ethers'
import '@nomiclabs/hardhat-waffle'
import { ethers } from 'hardhat'
import { expect } from 'chai'
import { beforeEach, describe } from 'mocha'
import { Contract, ContractFactory } from '@ethersproject/contracts'

describe('Greeter', function () {
  let Greeter: ContractFactory
  let greeter: Contract

  beforeEach(async () => {
    Greeter = await ethers.getContractFactory('Greeter')
    greeter = await Greeter.deploy('Hello, world!')
    await greeter.deployed()
  })

  it("Should return the new greeting once it's changed", async function () {
    expect(await greeter.greet()).to.equal('Hello, world!')
    const setGreetingTx = await greeter.setGreeting('Hola, mundo!')
    await setGreetingTx.wait()
    expect(await greeter.greet()).to.equal('Hola, mundo!')
  })
})
