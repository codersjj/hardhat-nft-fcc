const path = require("path")
const fs = require("fs")
const { Blob } = require("buffer")
const { PinataSDK } = require("pinata")
const { vars } = require("hardhat/config")

const pinata = new PinataSDK({
  pinataJwt: vars.get("PINATA_JWT"),
  pinataGateway: vars.get("PINATA_GATEWAY"),
})

async function storeImages(imagesDirPath) {
  const absoluteImagesDirPath = path.resolve(imagesDirPath)
  const files = fs.readdirSync(absoluteImagesDirPath)
  console.log("files", files)

  let res = []
  console.log("Uploading images to Pinata...")
  for (const file of files) {
    console.log(`Working on file: ${file} ...`)
    const filePath = path.join(absoluteImagesDirPath, file)
    // const readStream = fs.createReadStream(filePath)
    const blob = new Blob([fs.readFileSync(filePath)])
    const _file = new File([blob], file)
    try {
      const upload = await pinata.upload.public.file(_file)
      console.log("🚀 ~ storeImages ~ upload:", upload)
      res.push(upload)
    } catch (error) {
      console.log(error)
    }
  }

  return { res, files }
}

module.exports = {
  storeImages,
}
