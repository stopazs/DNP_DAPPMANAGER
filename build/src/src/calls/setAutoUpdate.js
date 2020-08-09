const fs = require("fs");
const getPath = require("utils/getPath");
const restartPatch = require("modules/restartPatch");
const params = require("params");
const docker = require("modules/docker");
const { eventBus, eventBusTag } = require("eventBus");
const db = require("../db");

/**
 * Calls docker rm and docker up on a package
 *
 * @param {string} id DNP .eth name
 */
const setAutoUpdate = async ({ id, autoUpdate }) => {
    if (!id) throw Error("kwarg id must be defined");

    const dbKey = `autoupdate-${id.replace(/\./g, "_")}`;
    db.set(dbKey, autoUpdate);

    // Emit packages update
    eventBus.emit(eventBusTag.emitPackages);


    const message = autoUpdate ? `Enabled auto-updates for ${id}` : `Disabled auto-updates  for ${id}`;

    return {
        message: message, //`Set autoupdate of package: ${id} to ${autoUpdate}`,
        logMessage: true,
        userAction: true
    };
};

module.exports = setAutoUpdate;