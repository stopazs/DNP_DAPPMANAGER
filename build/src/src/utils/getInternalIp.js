const shell = require("../utils/shell");
// const getDappmanagerImage = require("../utils/getDappmanagerImage");
const isIp = require("is-ip");
const logs = require("../logs.js")(module);

async function getInternalIp({ silent } = {}) {
  try {
    // const dappmanagerImage = await getDappmanagerImage();
    const internalIp = await shell(
      `/sbin/ip route|awk '/default/ { print $3 }'`,
      { trim: true }
    );
    return isIp(internalIp) ? internalIp : null;
  } catch (e) {
    if (!silent) logs.error(`Error getting internal IP: ${e.message}`);
  }
}

module.exports = getInternalIp;
