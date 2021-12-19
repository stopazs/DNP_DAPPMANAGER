const shell = require("utils/shell");
const parseGeneralErrors = require("./parseGeneralErrors");

async function upnpcCommand(cmd) {
  try {
    // const image = await shell(
    //   `docker inspect DAppNodeCore-vpn.dnp.dappnode.eth -f '{{.Config.Image}}'`,
    //   { trim: true }
    // );
    // return await shell(`docker run --rm --net=host ${image} upnpc ${cmd} `);
    return await shell(`docker run --rm --privileged  --net=host --pid=host --ipc=host --volume /:/host  busybox  chroot /host upnpc ${cmd} `);
  } catch (e) {
    parseGeneralErrors(e.message);
    throw e;
  }
}

module.exports = upnpcCommand;
