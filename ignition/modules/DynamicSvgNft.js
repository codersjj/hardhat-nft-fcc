const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules")
const {
  networkConfig,
  DECIMALS,
  INITIAL_ANSWER,
  developmentChains,
} = require("../../helper-hardhat-config")
const { network } = require("hardhat")

module.exports = buildModule("DynamicSvgNft", (m) => {
  const lowSvg = m.getParameter("lowSvg")
  const highSvg = m.getParameter("highSvg")

  const chainId = network.config.chainId
  const currentNetworkConfig = networkConfig[chainId]
  const { ethUsdPriceFeed } = currentNetworkConfig

  let ethUsdPriceFeedAddress = ethUsdPriceFeed

  if (developmentChains.includes(network.name)) {
    const deployer = m.getAccount(0)

    const mockV3Aggregator = m.contract(
      "MockV3Aggregator",
      [DECIMALS, INITIAL_ANSWER],
      {
        from: deployer,
      }
    )

    ethUsdPriceFeedAddress = mockV3Aggregator
  }

  const dynamicSvgNft = m.contract("DynamicSvgNft", [
    ethUsdPriceFeedAddress,
    lowSvg,
    highSvg,
  ])

  return { dynamicSvgNft }
})
