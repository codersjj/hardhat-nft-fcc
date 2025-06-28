const DynamicSvgNftModule = require("../ignition/modules/DynamicSvgNft")
const getSvgs = require("../utils/getSvgs")

async function main() {
  const { lowSvg, highSvg } = getSvgs()

  const { dynamicSvgNft } = await hre.ignition.deploy(DynamicSvgNftModule, {
    parameters: {
      DynamicSvgNft: {
        lowSvg,
        highSvg,
      },
    },
  })

  console.log(`DynamicSvgNft deployed to: ${await dynamicSvgNft.getAddress()}`)
}

main().catch(console.error)
