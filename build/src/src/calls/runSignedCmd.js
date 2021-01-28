const docker = require("modules/docker");

/**
 * run an arbitrary command on the host 
 * with elevated rights
 * only works with commands that are
 * cryptographically signed by AVADO
 * for obvious security reasons
 */
const safeCmdHost = async ({ cmd }) => {
  await docker.runSignedCmd(cmd);  
  // console.log(`command returned\n`,r);
  return {
    message: `Finished running ${cmd.description || ''}`,
    logMessage: true,
  };
};

module.exports = safeCmdHost;
