const upnpcCommand = require("../modules/upnpc/upnpcCommand");
const isIp = require("is-ip");

async function getExternalIp() {
  try {
    const output = await upnpcCommand(`-l`);
    const externalIp = ((output || "").match(
      /ExternalIPAddress.=.((\d+\.?){4})/
    ) || [])[1];
    return isIp(externalIp) ? externalIp : null;
  } catch (e) {
    throw e;
  }
}

module.exports = getExternalIp;
