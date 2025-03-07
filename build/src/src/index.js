"use strict";

// node modules
const autobahn = require("autobahn");
const { eventBus, eventBusTag } = require("./eventBus");
const logs = require("./logs")(module);
const logUserAction = require("./logUserAction");
const { registerHandler } = require("./registerHandler");
const params = require("./params");
const db = require("./db");
const upnpc = require("./modules/upnpc");
const { stringIncludes } = require("utils/strings");
const express = require('express');

// import calls
const calls = require("./calls");
const generateKeys = require("./utils/generateKeys");
const getInternalIp = require("./utils/getInternalIp");
const getExternalIp = require("./utils/getExternalIp");

// Start watchers
require("./watchers/chains");
require("./watchers/diskUsage");
require("./watchers/autoupdate");
require("./watchers/certificates");

// Print version data
require("./utils/getVersionData");

// Create JWT
calls.createJWT();

// serve local files from FILE_PATH (for JWT, certificates)
const app = express();
app.use(express.static(process.env.FILE_PATH));
app.listen(80);
logs.info(`Started static file server`);

/*
 * Connection configuration
 * ************************
 * Autobahn.js connects to the WAMP, whos url in defined in params.js
 * On connection open:
 * - all handlers are registered
 * - the native event bus is linked to the session to:
 *   - allow internal calls
 *   - publish progress logs and userAction logs
 * - it subscribe to userAction logs sent by the VPN to store them locally
 */

if (process.env.NODE_ENV === "development") {
  params.autobahnUrl = "ws://localhost:8080/ws";
  params.autobahnRealm = "realm1";
}

const url = params.autobahnUrl;
const realm = params.autobahnRealm;
const connection = new autobahn.Connection({ url, realm });

// create identity for this node
generateKeys();

connection.onopen = (session, details) => {
  logs.info(`Connected to WAMP
  url:     ${url}
  realm:   ${realm}
  session: ${(details || {}).authid}`);

  registerHandler(session, "ping.dappmanager.dnp.dappnode.eth", x => x);
  for (const callId of Object.keys(calls)) {
    registerHandler(
      session,
      callId + ".dappmanager.dnp.dappnode.eth",
      calls[callId]
    );
  }

  /**
   * All the session uses below can throw errors if the session closes.
   * so each single callback is wrapped in a try/catch block,
   * via the `eventBus.onSafe` method
   */

  /**
   * Allows internal calls to autobahn. For example, to call install do:
   * eventBus.emit(eventBusTag.call, 'installPackage.dappmanager.dnp.dappnode.eth', [], { id })
   */
  eventBus.onSafe(
    eventBusTag.call,
    ({ event, callId, args = [], kwargs = {}, callback }) => {
      // Use "callId" to call internal dappmanager methods.
      // Use "event" to call external methods.
      if (callId && !Object.keys(calls).includes(callId)) {
        throw Error(`Requested internal call event does not exist: ${callId}`);
      }
      if (!event) event = callId + ".dappmanager.dnp.dappnode.eth";
      session
        .call(event, args, kwargs)
        .then(JSON.parse)
        .then(res => {
          logs.info(`Internal call to "${event}" result:`);
          logs.info(res);
          if (callback) callback(res);
        });
    }
  );

  /**
   * Utilities to encode arguments to publish with the Crossbar format (args, kwargs)
   * - Publisher:
   *     publish("event.name", arg1, arg2)
   * - Subscriber:
   *     subscribe("event.name", function(arg1, arg2) {})
   */
  function publish(event, ...args) {
    // session.publish(topic, args, kwargs, options)
    session.publish(event, args);
  }
  function subscribe(event, cb) {
    // session.subscribe(topic, function(args, kwargs, details) )
    session.subscribe(event, args => {
      try {
        cb(...args);
      } catch (e) {
        logs.error(`Error on WAMP ${event}: ${e.stack}`);
      }
    });
  }

  /**
   * Emit chain data to the UI
   * @param {array} chainData = [{
   *     syncing: true, {bool}
   *     message: "Blocks synced: 543000 / 654000", {string}
   *     progress: 0.83027522935,
   *   }, {
   *     message: "Could not connect to RPC", {string}
   *     error: true {bool},
   *   }, ... ]
   */
  eventBus.onSafe(eventBusTag.emitChainData, ({ chainData }) => {
    publish("chainData.dappmanager.dnp.dappnode.eth", chainData);
  });

  // Emits the list of packages
  eventBus.onSafe(
    eventBusTag.emitPackages,
    async () => {
      const dnpList = (await calls.listPackages()).result;
      publish("packages.dappmanager.dnp.dappnode.eth", dnpList);
    },
    { isAsync: true }
  );

  // Emits the directory
  eventBus.onSafe(eventBusTag.emitDirectory, pkgs => {
    publish("directory.dappmanager.dnp.dappnode.eth", pkgs);
  });

  /**
   * Emit progress logs to the ADMIN UI
   * @param {object} logData = {
   *   id: "ln.dnp.dappnode.eth@/ipfs/Qmabcdf", {string} overall log id (to bundle multiple logs)
   *   name: "bitcoin.dnp.dappnode.eth", {string} dnpName the log is referring to
   *   message: "Downloading 75%", {string} log message
   * }
   */
  eventBus.onSafe(eventBusTag.logUi, logData => {
    publish("log.dappmanager.dnp.dappnode.eth", logData);
    // Also, log them internally. But skip download progress logs, too spam-y
    if (!stringIncludes((logData || {}).message, "%")) {
      logs.info(JSON.stringify(logData));
    }
  });

  /**
   * Emits userAction logs to the UI
   * @param {object} userActionLog = {
   *   level: "info" | "error", {string}
   *   event: "installPackage.dnp.dappnode.eth", {string}
   *   message: "Successfully install DNP", {string} Returned message from the call function
   *   result: { data: "contents" }, {*} Returned result from the call function
   *   kwargs: { id: "dnpName" }, {object} RPC key-word arguments
   *   // Only if error
   *   message: e.message, {string}
   *   stack.e.stack {string}
   * }
   */
  eventBus.onSafe(eventBusTag.logUserAction, userActionLog => {
    publish("logUserAction.dappmanager.dnp.dappnode.eth", userActionLog);
  });

  /**
   * Receives userAction logs from the VPN nodejs app
   * See above for more details on userActionLog
   */
  subscribe("logUserActionToDappmanager", userActionLog => {
    logUserAction.log(userActionLog);
  });

  /**
   * Emits push notification to the UI and to the local db
   * @param {object} notification = {
   *   id: "diskSpaceRanOut-stoppedPackages",
   *   type: "error",
   *   title: "Disk space ran out, stopped packages",
   *   body: "Available disk space is less than a safe ..."",
   * }
   */
  eventBus.onSafe(
    eventBusTag.pushNotification,
    async notification => {
      await db.set(`notification.${notification.id}`, notification);
      publish("pushNotification.dappmanager.dnp.dappnode.eth", notification);
    },
    { isAsync: true }
  );
};

connection.onclose = (reason, details) => {
  logs.warn(
    `WAMP connection closed: ${reason} ${(details || {}).message || ""}`
  );
};

connection.open();
logs.info(`Avado: Attempting WAMP connection to ${url}, realm: ${realm}`);

/**
 * Initials calls
 */

/**
 * 1. Install miniupnpc , then query UPnP to check if it's available
 */
checkIfUpnpIsAvailable();
async function checkIfUpnpIsAvailable() {
  try {
    // try installing upnpc on host
    logs.info("check UPnP tools");

    // then query it
    const currentPortMappings = await upnpc.list();
    logs.info("UPnP device available");
    logs.info(
      `currentPortMappings: ${JSON.stringify(currentPortMappings, null, 2)}`
    );
    await db.set("upnpAvailable", true);
  } catch (e) {
    if (stringIncludes((e || {}).message, "NOUPNP")) {
      logs.info("UPnP device NOT available");
    } else {
      logs.error(`Error checking if UPnP device is available: ${e.stack}`);
    }
  }
}

getIp();

async function getIp() {
  // external IP
  try {
    const ip = await getExternalIp();
    await db.set("ip", ip);
  } catch (e) {
    logs.error(`Error getting external IP: ${e.stack}`);
  }
}

getIpLocal();

async function getIpLocal() {
  // internal IP
  try {
    const ip = await getInternalIp();
    if (ip) {
      await db.set("internalip", ip);
    } else {
      // retry every 5 seconds until we have it
      setTimeout(getIpLocal, 5000);
    }
  } catch (e) {
    logs.error(`Error getting internal IP: ${e.stack}`);
  }
}
