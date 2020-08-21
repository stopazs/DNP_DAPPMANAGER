"use strict";

// const params = require("../../params");
const calls = require("../../calls");
const axios = require("axios");
const ipfs = require("../../modules/ipfs");
const semver = require('semver');
const db = require("../../db");
const logs = require("logs.js")(module);

const findLatestVersion = (store, packagename) => {
    const latestPackage = store.packages.find((p) => { return p.manifest.name === packagename });
    // if (!latestPackage){
    //     console.log(`Cannot find latest version of ${packagename}`);
    // }
    return latestPackage ? {hash:latestPackage.manifesthash, manifest: latestPackage.manifest} : null;
};

const monitorUpdates = () => {
    const r = calls.listPackages().then((res) => { return res.result });
    const r2 = axios.get("https://bo.ava.do/value/store").then((res) => {
        const hash = JSON.parse(res.data).hash;
        return ipfs.cat(hash).then(JSON.parse);
    });

    Promise.all([
        r,
        r2]).then(async ([packageList, store]) => {
            const upgrades = Promise.all(packageList.map(async (installedPackage) => {
                const dbKey = `autoupdate-${installedPackage.name.replace(/\./g, "_")}`;
                const autoUpdateDB = await db.get(dbKey);
                const autoUpdate = autoUpdateDB === undefined ? installedPackage.manifest.autoupdate || false : autoUpdateDB;
                if (autoUpdate === true) {
                    // console.log(`${installedPackage.name} has autoupdates on`);
                    const latestVersion = findLatestVersion(store, installedPackage.name);
                    if (latestVersion && semver.gt(latestVersion.manifest.version, installedPackage.version)) {
                        // console.log(`package ${installedPackage.name} needs update from ${installedPackage.version}->${latestVersion.manifest.version}`);
                        return (`${installedPackage.name}@${latestVersion.hash}`);
                    } else {
                        // console.log(`no update. local=${installedPackage ? installedPackage.version : "unknown"}, store=${latestVersion ? latestVersion.version : "unknown"}`);
                    }
                } else {
                    //		console.log(`no auto update for package ${installedPackage.name}`);
                }
                return null;
            }));

            upgrades.then((upgradeList) => {
                const toUpgrade = upgradeList.reduce((accum, item) => {
                    item && accum.push(item);
                    return accum;
                }, [])
                // console.log(toUpgrade);
                if (toUpgrade.length > 0) {
                    // pick random item
                    var item = toUpgrade[Math.floor(Math.random() * toUpgrade.length)];
                    logs.info(`update package ${item}`);
                    calls.installPackage({ id: item }).then(() => { logs.info(`installed package ${item}`) });

                }
            });
        });
};

const monitoringInterval = 60 * 60 * 1000; // (ms) (1 hour)
monitorUpdates();
setInterval(() => {
    monitorUpdates();
}, monitoringInterval);

module.exports = monitorUpdates;

