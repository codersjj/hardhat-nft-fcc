const { network, ethers } = require("hardhat")
const {
  developmentChains,
  networkConfig,
} = require("../../helper-hardhat-config")
const { IMAGES_DIR_PATH } = require("../../constants")
const { getImageFileCount } = require("../../utils/uploadToPinata")
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers")
const { assert, expect } = require("chai")

!developmentChains.includes(network.name)
  ? describe.skip
  : describe("RandomIpfsNft Unit Tests", function () {
      const deployRandomIpfsNftFixture = async () => {
        const [deployer] = await ethers.getSigners()

        const BASE_FEE = ethers.parseEther("0.001")
        const GAS_PRICE = ethers.parseUnits("50", "gwei")
        const WEI_PER_UNIT_LINK = ethers.parseEther("0.01")

        const chainId = network.config.chainId

        const vrfCoordinatorV2_5MockFactory = await ethers.getContractFactory(
          "VRFCoordinatorV2_5Mock"
        )
        const vrfCoordinatorV2_5Mock = await vrfCoordinatorV2_5MockFactory
          .connect(deployer)
          .deploy(BASE_FEE, GAS_PRICE, WEI_PER_UNIT_LINK)

        const fundAmount =
          networkConfig[chainId]["fundAmount"] || ethers.parseEther("30")
        const transaction = await vrfCoordinatorV2_5Mock.createSubscription()
        const transactionReceipt = await transaction.wait(1)
        // console.log(
        //   "🚀 ~ deployRandomIpfsNftFixture ~ transactionReceipt.logs:",
        //   transactionReceipt.logs
        // )
        const subscriptionId = BigInt(transactionReceipt.logs[0].topics[1])
        await vrfCoordinatorV2_5Mock.fundSubscription(
          subscriptionId,
          fundAmount
        )

        const { gasLane, callbackGasLimit, enableNativePayment, mintFee } =
          networkConfig[chainId]
        const imageFileCount = getImageFileCount(IMAGES_DIR_PATH)
        const dogTokenURIs = Array(imageFileCount)
          .fill()
          .map((_, index) => `ipfs-uri${index + 1}`)
        // console.log(
        //   "🚀 ~ deployRandomIpfsNftFixture ~ dogTokenURIs:",
        //   dogTokenURIs
        // )

        const args = [
          vrfCoordinatorV2_5Mock.target,
          subscriptionId,
          gasLane,
          callbackGasLimit,
          enableNativePayment,
          dogTokenURIs,
          mintFee,
        ]

        const randomIpfsNft = await ethers.deployContract(
          "RandomIpfsNft",
          args,
          deployer
        )

        await vrfCoordinatorV2_5Mock.addConsumer(
          subscriptionId,
          randomIpfsNft.target
        )

        return {
          randomIpfsNft,
          vrfCoordinatorV2_5Mock,
          gasLane,
          callbackGasLimit,
          enableNativePayment,
          dogTokenURIs,
          mintFee,
          deployer,
        }
      }

      describe("Constructor", async () => {
        it("Sets starting values correctly", async () => {
          const {
            randomIpfsNft,
            gasLane,
            callbackGasLimit,
            enableNativePayment,
            dogTokenURIs,
            mintFee,
          } = await loadFixture(deployRandomIpfsNftFixture)
          const name = await randomIpfsNft.name()
          const symbol = await randomIpfsNft.symbol()
          const actualEnableNativePayment =
            await randomIpfsNft.getEnableNativePayment()
          const actualMintFee = await randomIpfsNft.getMintFee()

          assert.equal(name, "Random IPFS NFT")
          assert.equal(symbol, "RIN")
          assert.equal(actualEnableNativePayment, enableNativePayment)
          assert.equal(actualMintFee, mintFee)

          for (let i = 0; i < dogTokenURIs.length; i++) {
            const dogTokenURI = await randomIpfsNft.getDogTokenURI(i)
            assert.equal(dogTokenURI, dogTokenURIs[i])
          }
        })
      })

      describe("requestNft", async () => {
        it("fails if payment isn't sent with the request", async () => {
          const { randomIpfsNft } = await loadFixture(
            deployRandomIpfsNftFixture
          )
          // await assert.isRejected(randomIpfsNft.requestNft())
          await expect(
            randomIpfsNft.requestNft()
          ).to.be.revertedWithCustomError(
            randomIpfsNft,
            "RandomIpfsNft__NeedMoreETHSent"
          )
        })

        it("Reverts if payment amount is less than the mint fee", async () => {
          const { randomIpfsNft, mintFee } = await loadFixture(
            deployRandomIpfsNftFixture
          )
          const insufficientPayment = mintFee - ethers.parseEther("0.001")
          await expect(
            randomIpfsNft.requestNft({ value: insufficientPayment })
          ).to.be.revertedWithCustomError(
            randomIpfsNft,
            "RandomIpfsNft__NeedMoreETHSent"
          )
        })

        it("Emits an event and kicks off a random word request", async () => {
          const { randomIpfsNft, mintFee } = await loadFixture(
            deployRandomIpfsNftFixture
          )
          await expect(
            randomIpfsNft.requestNft({
              value: mintFee,
            })
          ).to.emit(randomIpfsNft, "NFTRequested")
        })
      })

      describe("fulfillRandomWords", async () => {
        it("Mints an NFT after random number is returned", async () => {
          const { randomIpfsNft, vrfCoordinatorV2_5Mock, deployer, mintFee } =
            await loadFixture(deployRandomIpfsNftFixture)
          const tokenCounter = await randomIpfsNft.getTokenCounter()
          await new Promise(async (resolve, reject) => {
            randomIpfsNft.once("NFTMinted", async (breed, minter) => {
              console.log(
                "🚀 ~ randomIpfsNft.once ~ breed, minter:",
                breed,
                minter
              )
              try {
                const tokenId = await randomIpfsNft.getTokenCounter()
                const tokenURI = await randomIpfsNft.tokenURI(tokenId - 1n)
                const dogTokenURI = await randomIpfsNft.getDogTokenURI(breed)
                assert.equal(tokenURI, dogTokenURI)
                assert(dogTokenURI.startsWith("ipfs"))
                assert.equal(minter, deployer.address)
                assert.equal(tokenId, tokenCounter + 1n)
                resolve()
              } catch (error) {
                console.log("Error in NFTMinted event:", error)
                reject(error)
              }
            })

            try {
              const requestNftTx = await randomIpfsNft.requestNft({
                value: mintFee,
              })
              const requestNftTxReceipt = await requestNftTx.wait(1)
              // console.log("requestNftTxReceipt.logs", requestNftTxReceipt.logs)
              await vrfCoordinatorV2_5Mock.fulfillRandomWords(
                requestNftTxReceipt.logs[1].topics[1],
                randomIpfsNft.target
              )
              // resolve()
            } catch (error) {
              console.log(error)
              reject(error)
            }
          })
        })
      })
    })
