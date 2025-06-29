const path = require("path")
const fs = require("fs")
const { storeImages, storeMetadata } = require("./uploadToPinata")
const { IMAGES_DIR_PATH } = require("../constants")

const metadataTemplate = {
  name: "",
  description: "",
  image: "",
  attributes: [
    {
      trait_type: "Cuteness",
      value: 100,
    },
  ],
}

async function handleTokenURIs() {
  let tokenURIs = []

  // store the image in IPFS
  const { res: uploads } = await storeImages(IMAGES_DIR_PATH)
  // store the metadata in IPFS
  const res = await storeMetadata(metadataTemplate, uploads)

  res.forEach((upload) => {
    tokenURIs.push(`ipfs://${upload.cid}`)
  })

  console.log("🚀 ~ handleTokenURIs ~ tokenURIs:", tokenURIs)

  return tokenURIs
}

function updateTokenURIsInParametersJson(tokenURIs) {
  const parametersPath = path.join(__dirname, "../ignition/parameters.json")
  const parameters = JSON.parse(fs.readFileSync(parametersPath, "utf8"))
  parameters.RandomIpfsNft = parameters.RandomIpfsNft || {}
  parameters.RandomIpfsNft.dogTokenURIs = tokenURIs
  fs.writeFileSync(parametersPath, JSON.stringify(parameters, null, 2))
  console.log("Updated parameters.json with tokenURIs.")
}

module.exports = {
  handleTokenURIs,
  updateTokenURIsInParametersJson,
}
