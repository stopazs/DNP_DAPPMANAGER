const validate = require('utils/validate');
const ipfsDefault = require('modules/ipfs');

function createGetManifest({
  apm,
  ipfs = ipfsDefault,
}) {
  return async function getManifest(packageReq) {
    // Expects a package request object
    // returns and manifest object
    validate.packageReq(packageReq);
    if (packageReq.name.endsWith('.eth')) {
      if (packageReq.ver.startsWith('/ipfs/Qm')) {
        packageReq.hash = packageReq.ver;
      } else {
        // packageReq.hash = 'ipfs/QmUHFxFbYdJDueBWzYZnvpzkjwBmMt3bmNDLQBTZzY18UZ';
        packageReq.hash = await apm.getRepoHash(packageReq);
      }

    // if the name of the package is already an IFPS hash, skip:
    } else if (packageReq.name.startsWith('/ipfs/Qm')) {
      packageReq.hash = packageReq.name;
    } else {
      throw Error('Unkown package request: '+packageReq.name);
    }


    // cat the file and parse it
    const manifest = JSON.parse( await ipfs.cat(packageReq.hash) );

    // Verify that the request was correct
    if (packageReq.name && packageReq.name.endsWith('.eth')
    && manifest && manifest.name
    && packageReq.name !== manifest.name) {
      throw Error('Package name requested doesn\'t match its manifest');
    }
    return manifest;
  };
}


module.exports = createGetManifest;
