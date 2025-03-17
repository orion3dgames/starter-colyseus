import { createLogger, format, transports, config } from "winston";

export class Logger {
    private logger;
    private service: string = "server";
    constructor(logLevel) {
        this.logger = createLogger({
            level: logLevel,
            levels: config.syslog.levels,
            format: format.json(),
            transports: [
                new transports.Console({
                    format: format.simple(),
                }),
            ],
        });
    }

    public info(message, data: any = []) {
        this.logger.info(message, data);
    }

    public warn(message, data: any = []) {
        this.logger.warning(message, data);
    }

    public error(message, data: any = []) {
        this.logger.error(message, data);
    }

    public debug(message, data: any = []) {
        this.logger.debug(message, data);
    }
}

// export instance of MyModule directly
export default new Logger("info");
