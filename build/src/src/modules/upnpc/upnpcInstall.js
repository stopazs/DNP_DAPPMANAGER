const shell = require("utils/shell");
const parseGeneralErrors = require("./parseGeneralErrors");
const logs = require("logs.js")(module);

async function upnpcInstall() {
  try {
    logs.info("updating apt-get");
    await shell(`docker run --rm --privileged  --net=host --pid=host --ipc=host --volume /:/host  busybox  chroot /host apt-get update`);
    logs.info("installing miniupnpc on host");
    await shell(`docker run --rm --privileged  --net=host --pid=host --ipc=host --volume /:/host  busybox  chroot /host apt-get install -y miniupnpc`);
    logs.info("finished installing miniupnpc on host");
  } catch (e) {
    parseGeneralErrors(e.message);
    throw e;
  }
}

module.exports = upnpcInstall;
