const ethUtil = require("ethereumjs-util");
/**
 * verifies signature on a string
 *
 * @param {string} stingToCheck string to check
 * @param {string} signature hex encoded signature to check
 */
const recoverSignature = (stingToCheck,signature) => {
  try {
      const msg = Buffer.from(stingToCheck);
      const msgHash = ethUtil.hashPersonalMessage(msg);

      var sigDecoded = ethUtil.fromRpcSig(signature)
      var recoveredPub = ethUtil.ecrecover(msgHash, sigDecoded.v, sigDecoded.r, sigDecoded.s)
      var recoveredAddress = ethUtil.pubToAddress(recoveredPub).toString("hex")
      return recoveredAddress;
  } catch (e) {
      // console.log("ERROR",e.message);
      return null;
  }
}

module.exports = recoverSignature;
