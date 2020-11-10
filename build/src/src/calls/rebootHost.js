const docker = require("modules/docker");

/**
 * Reboots the host
 */
const rebootHost = async () => {
  
  docker.rebootHost();

  return {
    message: `rebooting host - please reconnect after restart`
  };
};

module.exports = rebootHost;
