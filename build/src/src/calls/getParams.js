const db = require("../db");

/**
 * Returns the current DAppNode identity
 *
 * @return {Object} DAppNode's params.
 * result = params = {
 *   ip: "85.84.83.82",
 *   name: "My-DAppNode",
 *   staticIp: "85.84.83.82" | null,
 *   domain: "1234acbd.dyndns.io",
 *   upnpAvailable: true | false,
 *   noNatLoopback: true | false,
 *   alertToOpenPorts: true | false,
 *   internalIp: 192.168.0.1,
 * }
 */
async function getParams() {
  const _db = await db.get();

  // identity
  const avadoIdentity = {
    ip: _db.ip,
    internalip: _db.internalip,
    name: _db.name || "AVADO",
    nodeid: _db.address,
    // staticIp: _db.staticIp,
    // domain: _db.domain
  };

  // Status parameteres
  const statusParameters = {
    // upnpAvailable: _db.upnpAvailable,
    // noNatLoopback: _db.noNatLoopback,
    // alertToOpenPorts: _db.alertToOpenPorts,
    // internalIp: _db.internalIp
  };

  return {
    result: { ...avadoIdentity, ...statusParameters }
  };
}

module.exports = getParams;
