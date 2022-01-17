const docker = require("./Docker");
const dockerSafe = require("./dockerSafe");
const logs = require("logs.js")(module);

function iterate(obj) {
  for (var property in obj) {
      if (obj.hasOwnProperty(property)) {
          if (typeof obj[property] == "object") {
              iterate(obj[property]);
          }
          else {
            logs.info(`property ${property} type ${typeof obj[property]}`)
          }
      }
  }
}
logs.info(`docker on index`)
iterate(docker);

module.exports = {
  ...docker,
  safe: dockerSafe
};
