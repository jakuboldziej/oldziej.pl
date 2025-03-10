const { createLogger, transports, format } = require("winston");
require("winston-mongodb");
require("dotenv").config();

const ENV = process.env.NODE_ENV || "development";
const DB_LOG_URI =
  ENV === "production" ? process.env.DB_LOG_URI_PROD : process.env.DB_LOG_URI_DEV;

const logger = createLogger({
  format: format.combine(format.json()),

  transports: [
    new transports.Console({
      format: format.combine(
        format.timestamp({ format: "DD.MM.YYYY HH:mm:ss" }),
        format.colorize(),
        format.simple()
      ),
    }),

    new transports.MongoDB({
      level: "info",
      db: DB_LOG_URI,
      collection: ENV === "production" ? "prod_info_logs" : "dev_info_logs",
    }),

    new transports.MongoDB({
      level: "error",
      db: DB_LOG_URI,
      collection: ENV === "production" ? "prod_error_logs" : "dev_error_logs",
    }),

    new transports.MongoDB({
      level: "warn",
      db: DB_LOG_URI,
      collection: ENV === "production" ? "prod_warn_logs" : "dev_warn_logs",
    }),
  ],
});

module.exports = { logger };
