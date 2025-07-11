const { vars } = require("hardhat/config")

require("@nomicfoundation/hardhat-toolbox")
require("@nomicfoundation/hardhat-ethers")
require("@nomicfoundation/hardhat-chai-matchers")
require("dotenv").config()

const PRIVATE_KEY = vars.get("SEPOLIA_PRIVATE_KEY")
const ALCHEMY_API_KEY = vars.get("ALCHEMY_API_KEY")
const ETHERSCAN_API_KEY = vars.get("ETHERSCAN_API_KEY")

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.28",
  networks: {
    hardhat: {
      chainId: 31337,
    },
    localhost: {
      chainId: 31337,
    },
    sepolia: {
      chainId: 11155111,
      url: `https://eth-sepolia.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
      accounts: [PRIVATE_KEY],
    },
  },
  etherscan: {
    // Your API key for Etherscan
    // Obtain one at https://etherscan.io/
    apiKey: ETHERSCAN_API_KEY,
  },
  sourcify: {
    // Disabled by default
    // Doesn't need an API key
    enabled: true,
  },
  // see: https://hardhat.org/ignition/docs/config#configuration-options
  ignition: {
    // blockPollingInterval: 1_000,
    // timeBeforeBumpingFees: 3 * 60 * 1_000,
    // maxFeeBumps: 4,
    requiredConfirmations: 1,
    // disableFeeBumping: false,
  },
  // mocha: {
  //   timeout: 200000, // 200 seconds max for running tests
  // },
}
