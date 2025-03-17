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
 * Generate a hexadecimal color from a number between 0-100
 * @param value number between 0 - 100
 * @returns
 */
const getHealthColorFromValue = function (value) {
    let gHex = Math.round((value * 255) / 100); // rule of three to calibrate [0, 100] to [00, FF] (= [0, 255])
    let rHex = 255 - gHex; // just the mirror of gHex
    let gHexString = gHex.toString(16); // converting to traditional hex representation
    let rHexString = rHex.toString(16);
    gHexString = gHexString.length === 1 ? `0${gHex}` : gHexString; // compensating missing digit in case of single digit values
    rHexString = rHexString.length === 1 ? `0${rHex}` : rHexString;
    return `#${rHexString}${gHexString}00`; // composing both in a color code
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

export { generateUserName, isLocal, roundToTwo, roundTo, countPlayers, clamp, randomNumberInRange, distanceBetween, getHealthColorFromValue, bytesToSize };
