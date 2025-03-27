export default class Debugger {
    static levels = {
        log: "color: white;",
        info: "color: green;",
        warn: "color: orange;",
        error: "color: red; font-weight: bold;",
    };

    static log(prefix = "DEBUG", message, data = null) {
        Debugger.output("log", prefix, message, data);
    }

    static info(prefix = "DEBUG", message, data = null) {
        Debugger.output("info", prefix, message, data);
    }

    static warn(prefix = "DEBUG", message, data = null) {
        Debugger.output("warn", prefix, message, data);
    }

    static error(prefix = "DEBUG", message, data = null) {
        Debugger.output("error", prefix, message, data);
    }

    static output(level, prefix, message, data) {
        const timestamp = new Date().toISOString();
        const formattedPrefix = `[${prefix}]`;

        if (console[level]) {
            console[level](`%c${formattedPrefix} ${message}`, Debugger.levels[level], data ?? "");
        } else {
            console.log(`%c${formattedPrefix} ${message}`, Debugger.levels["log"], data ?? "");
        }
    }
}
