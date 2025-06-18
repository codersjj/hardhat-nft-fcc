const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules")
const { network, ethers } = require("hardhat")
const {
  developmentChains,
  networkConfig,
} = require("../../helper-hardhat-config")

const BASE_FEE = ethers.parseEther("0.001")
const GAS_PRICE = ethers.parseUnits("50", "gwei")
const WEI_PER_UNIT_LINK = ethers.parseEther("0.01")
const VRF_SUB_FUND_AMOUNT = ethers.parseEther("30")

module.exports = buildModule("RandomIpfsNft", (m) => {
  const chainId = network.config.chainId
  const currentNetworkConfig = networkConfig[chainId]
  const { mintFee, gasLane, callbackGasLimit, enableNativePayment } =
    currentNetworkConfig

  let vrfCoordinatorAddress
  let subscriptionId

  // Deploy VRFCoordinatorV2_5Mock for development chains
  if (developmentChains.includes(network.name)) {
    console.log(
      "development chain detected, deploying VRFCoordinatorV2_5Mock..."
    )
    const vrfCoordinator = m.contract("VRFCoordinatorV2_5Mock", [
      BASE_FEE,
      GAS_PRICE,
      WEI_PER_UNIT_LINK,
    ])

    // Create and fund subscription
    const createSubscription = m.call(
      vrfCoordinator,
      "createSubscription",
      [],
      {
        id: "createSubscription",
      }
    )

    // Get subscriptionId from event
    const subscriptionIdFuture = m.readEventArgument(
      createSubscription,
      "SubscriptionCreated",
      "subId"
    )

    // Fund subscription
    m.call(vrfCoordinator, "fundSubscription", [
      subscriptionIdFuture,
      VRF_SUB_FUND_AMOUNT,
    ])

    vrfCoordinatorAddress = vrfCoordinator
    subscriptionId = subscriptionIdFuture
  } else if (chainId in networkConfig) {
    vrfCoordinatorAddress = currentNetworkConfig.vrfCoordinatorV2_5
    subscriptionId = currentNetworkConfig.subscriptionId
  }

  // Deploy RandomIpfsNft
  const randomIpfsNft = m.contract(
    "RandomIpfsNft",
    [
      vrfCoordinatorAddress,
      subscriptionId,
      gasLane,
      callbackGasLimit,
      enableNativePayment,
      ["", "", ""],
      mintFee,
    ],
    {
      id: "RandomIpfsNft",
      // after: [vrfCoordinatorAddress],
    }
  )

  // Add consumer to VRF subscription for development chains
  if (developmentChains.includes(network.name)) {
    m.call(
      vrfCoordinatorAddress,
      "addConsumer",
      [subscriptionId, randomIpfsNft],
      {
        id: "addConsumer",
      }
    )
  }

  return { vrfCoordinator: vrfCoordinatorAddress, randomIpfsNft }
})
