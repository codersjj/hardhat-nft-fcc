const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules")
const { ethers } = require("hardhat")

// Mock deployment parameters
// see:
// https://docs.chain.link/vrf/v2-5/subscription/test-locally#deploy-vrfcoordinatorv2_5mock
// https://github.com/smartcontractkit/hardhat-starter-kit/blob/main/test/unit/RandomNumberConsumer.spec.js
const BASE_FEE = ethers.parseEther("0.001") // the base fee
const GAS_PRICE = ethers.parseUnits("50", "gwei") // the gas price (in LINK tokens)
const WEI_PER_UNIT_LINK = ethers.parseEther("0.01") // the current LINK/ETH price

module.exports = buildModule("VRFCoordinatorV2_5Mock", (m) => {
  // see: https://blog.nomic.foundation/migrating-to-hardhat-ignition-from-hardhat-deploy-c17311bb658f/

  // see: https://hardhat.org/ignition/docs/guides/creating-modules#deploying-and-calling-contracts-from-different-accounts
  const deployer = m.getAccount(0)

  // Deploy VRFCoordinatorV2_5Mock with constructor arguments
  const vrfCoordinatorV2_5Mock = m.contract(
    "VRFCoordinatorV2_5Mock",
    [BASE_FEE, GAS_PRICE, WEI_PER_UNIT_LINK],
    {
      from: deployer,
    }
  )

  return {
    vrfCoordinatorV2_5Mock,
  }
})
