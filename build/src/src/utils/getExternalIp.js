// const upnpcCommand = require("../modules/upnpc/upnpcCommand");
const isIp = require("is-ip");
const axios = require("axios");
const logs = require("../logs.js")(module);

async function getExternalIp() {
  try {
    // try lucal upnp
    // const output = await upnpcCommand(`-l`);
    // const externalIp = ((output || "").match(
    //   /ExternalIPAddress.=.((\d+\.?){4})/
    // ) || [])[1];
    // if (isIp(externalIp)) return externalIp;

    // no external IP found - use external service
    const externalIpRemote = await axios.get("https://ipinfo.io/ip");
    if (externalIpRemote && externalIpRemote.data && isIp(externalIpRemote.data)){
      logs.info(`Got external IP: ${externalIpRemote.data}`);
      return externalIpRemote.data;
    }

    logs.info(`External IP not found`);
    // nothing found either - return null
    return null;
  } catch (e) {
    throw e;
  }
}

module.exports = getExternalIp;
