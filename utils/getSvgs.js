const fs = require("fs")
const path = require("path")

module.exports = function getSvgs() {
  const lowSvgPath = path.join(__dirname, "../images/dynamicNft/frown.svg")
  const lowSvg = fs.readFileSync(lowSvgPath, { encoding: "utf8" })
  const highSvgPath = path.join(__dirname, "../images/dynamicNft/happy.svg")
  const highSvg = fs.readFileSync(highSvgPath, { encoding: "utf8" })
  return { lowSvg, highSvg }
}
