import { uniqueNamesGenerator, animals, colors } from "unique-names-generator";

const isLocal = function () {
    return window.location.host === "localhost:8080";
};

const countPlayers = function (object) {
    var length = 0;
    for (var key in object) {
        if (object.hasOwnProperty(key)) {
            ++length;
        }
    }
    return length;
};

const randomNumberInRange = function (min, max) {
    return Math.random() * (max - min) + min;
};

const roundToTwo = function (num: number) {
    return Math.round(num * 100) / 100;
};

const roundTo = function (num: number, decimal: number = 2) {
    if (num) {
        let number = num.toFixed(decimal);
        return parseFloat(number);
    }
    return 0;
};

const bytesToSize = function (bytes) {
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    if (bytes === 0) return "n/a";
    const i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), sizes.length - 1);
    if (i === 0) return `${bytes} ${sizes[i]}`;
    return `${(bytes / 1024 ** i).toFixed(1)} ${sizes[i]}`;
};

const distanceBetween = function (a, b): number {
    return Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2) + Math.pow(a.z - b.z, 2));
};

const clamp = function (value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max);
};

/**
 * Generates a random username
 * @returns the username
 */
const generateUserName = function () {
    return uniqueNamesGenerator({
        dictionaries: [colors, animals],
        separator: " ",
        style: "capital",
    });
};

const generateRoomId = function () {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let result = "";
    for (let i = 0; i < 4; i++) result += chars.charAt(Math.floor(Math.random() * chars.length));
    return result;
};

const debug = (prefix = "DEBUG", message, data = null, level = "log") => {
    const levels = {
        log: "color: blue;",
        info: "color: green;",
        warn: "color: orange;",
        error: "color: red; font-weight: bold;",
    };

    const timestamp = new Date().toISOString();
    const formattedPrefix = `[${prefix}]`;

    if (console[level]) {
        console[level](`%c${formattedPrefix} ${message}`, levels[level], data ? data : "");
    } else {
        console.log(`%c${formattedPrefix} ${message}`, levels["log"], data ? data : "");
    }
};

export { generateUserName, isLocal, roundToTwo, roundTo, countPlayers, clamp, randomNumberInRange, distanceBetween, bytesToSize, generateRoomId, debug };
