const { network, ethers } = require("hardhat")
const {
  developmentChains,
  networkConfig,
} = require("../../helper-hardhat-config")
const { IMAGES_DIR_PATH } = require("../../constants")
const { getImageFileCount } = require("../../utils/uploadToPinata")
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers")
const { assert } = require("chai")

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
        const subscriptionId = BigInt(transactionReceipt.logs[0].topics[1])
        await vrfCoordinatorV2_5Mock.fundSubscription(
          subscriptionId,
          fundAmount
        )

        const { gasLane, callbackGasLimit, enableNativePayment, mintFee } =
          networkConfig[chainId]
        const imageFileCount = getImageFileCount(IMAGES_DIR_PATH)
        const dogTokenURIs = Array(imageFileCount).fill("")

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

        return { randomIpfsNft }
      }

      describe("Constructor", async () => {
        it("Initializes the contract correctly", async () => {
          const { randomIpfsNft } = await loadFixture(
            deployRandomIpfsNftFixture
          )
          const name = await randomIpfsNft.name()
          const symbol = await randomIpfsNft.symbol()

          assert.equal(name, "Random IPFS NFT")
          assert.equal(symbol, "RIN")
        })
      })
    })
