// const { eventBus, eventBusTag } = require("eventBus");
const db = require("../db");

/**
 * Change display name of this AVADO
 *
 * @param {string} name
 */
const setName = async ({ name }) => {
    if (!name) throw Error("kwarg name must be defined");

    db.set("name", name);

    // // Emit packages update
    // eventBus.emit(eventBusTag.emitPackages);

    return {
        // message: message, //`Set autoupdate of package: ${id} to ${autoUpdate}`,
        // logMessage: true,
        // userAction: true
    };
};

module.exports = setName;