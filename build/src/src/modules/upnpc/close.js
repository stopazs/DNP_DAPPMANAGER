const upnpcCommand = require("./upnpcCommand");
const validateKwargs = require("./validateKwargs");
const parseCloseOutput = require("./parseCloseOutput");

/**
 * Closes port = maps requested port to host
 * Actual command example:
 *   docker run --rm --net=host ${IMAGE} upnpc -e DAppNode -d 500 UDP
 *
 * @param {object} kwargs: {
 *   number: '3000',
 *   type: 'TCP',
 * }
 * @returns {*}
 */
async function close({ number, type }) {
  validateKwargs({ number, type });
  try {
    const res = await upnpcCommand(`-e DAppNode -d ${number} ${type}`);
    return parseCloseOutput(res);
  } catch (e) {
    parseCloseOutput(e.message);
    throw e;
  }
}

module.exports = close;
