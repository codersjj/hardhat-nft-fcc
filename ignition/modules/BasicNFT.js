const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules")

module.exports = buildModule("BasicNFTModule", (m) => {
  const basicNFT = m.contract("BasicNFT")

  return { basicNFT }
})
