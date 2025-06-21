const hre = require("hardhat")
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers")
const { developmentChains } = require("../../helper-hardhat-config")
const { assert } = require("chai")

!developmentChains.includes(hre.network.name)
  ? describe.skip
  : describe("BasicNFT", () => {
      async function deployBasicNFTFixture() {
        const [deployer] = await hre.ethers.getSigners()
        const basicNFT = await hre.ethers.deployContract("BasicNFT", deployer)

        return { basicNFT, deployer }
      }

      async function mintNFTFixture() {
        const [deployer] = await hre.ethers.getSigners()
        const basicNFT = await hre.ethers.deployContract("BasicNFT", deployer)

        const tx = await basicNFT.mintNFT()
        await tx.wait(1)

        return { basicNFT, deployer }
      }

      describe("Constructor", () => {
        it("Initialize the NFT correctly", async () => {
          const { basicNFT } = await loadFixture(deployBasicNFTFixture)
          const name = await basicNFT.name()
          const symbol = await basicNFT.symbol()
          const tokenCounter = await basicNFT.getTokenCounter()
          assert.equal(name, "Dogie")
          assert.equal(symbol, "DOG")
          assert.equal(tokenCounter, 0n)
        })
      })

      describe("Mint NFT", () => {
        it("Allows users to mint an NFT, and updates appropriately", async () => {
          const { basicNFT } = await loadFixture(mintNFTFixture)
          const tokenURI = await basicNFT.tokenURI(0)
          const tokenCounterAfter = await basicNFT.getTokenCounter()
          assert.equal(tokenCounterAfter, 1)
          assert.equal(tokenURI, await basicNFT.TOKEN_URI())
        })

        it("Show the correct balance and owner of an NFT", async () => {
          const { basicNFT, deployer } = await loadFixture(mintNFTFixture)

          const balance = await basicNFT.balanceOf(deployer.address)
          const owner = await basicNFT.ownerOf(0)
          assert.equal(owner, deployer.address)
          assert.equal(balance, 1)
        })
      })
    })
