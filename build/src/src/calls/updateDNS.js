const shellExec = require("utils/shell");
const logs = require("logs.js")(module);

const updateDNS = async () => {

  await wrapErrors(async () => {
    await shellExec(`/etc/periodic/1min/dns_updater`, true);   
  }, "updateDNS");

  return {
    message: `Updated DNS`,
    result: {
    }
  };
};

module.exports = updateDNS;

/**
 * Wraps the shell calls to return null in case of error
 * @param {function} fn async getter
 * @param {string} name for the message
 */
async function wrapErrors(fn, name) {
  try {
    return await fn();
  } catch (e) {
    logs.warn(`Error running ${name}: ${e.stack}`);
  }
}
