const fs = require("fs")
const path = require("path")
const DynamicSvgNftModule = require("../ignition/modules/DynamicSvgNft")

function getSvgs() {
  const lowSvgPath = path.join(__dirname, "../images/dynamicNft/frown.svg")
  const lowSvg = fs.readFileSync(lowSvgPath, { encoding: "utf8" })
  const highSvgPath = path.join(__dirname, "../images/dynamicNft/happy.svg")
  const highSvg = fs.readFileSync(highSvgPath, { encoding: "utf8" })
  return { lowSvg, highSvg }
}

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
