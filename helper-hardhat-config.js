const { ethers } = require("hardhat")

const networkConfig = {
  11155111: {
    name: "sepolia",
    vrfCoordinatorV2_5: "0x9DdfaCa8183c41ad55329BdeeD9F6A8d53168B1B",
    mintFee: ethers.parseEther("0.01"),
    gasLane:
      "0x787d74caea10b2b357790d5b5247c2f63d1d91572a9846f780606e4d953677ae",
    subscriptionId:
      "2285852935276885187536834546937285128228667036727270462860326086981248659160",
    callbackGasLimit: "500000",
    enableNativePayment: false,
    ethUsdPriceFeed: "0x694AA1769357215DE4FAC081bf1f309aDC325306",
  },
  31337: {
    name: "hardhat",
    mintFee: ethers.parseEther("0.01"),
    gasLane:
      "0x787d74caea10b2b357790d5b5247c2f63d1d91572a9846f780606e4d953677ae",
    callbackGasLimit: "500000",
    enableNativePayment: false,
  },
}

const developmentChains = ["hardhat", "localhost"]

const DECIMALS = 8
// see: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Lexical_grammar#numeric_separators
const INITIAL_ANSWER = 2600_00000000

module.exports = {
  networkConfig,
  developmentChains,
  DECIMALS,
  INITIAL_ANSWER,
}
