const { default: chalk } = require("chalk");
const morgan = require("morgan");

const loggerMiddleware = morgan(function (tokens, req, res) {
  return [
    "\n",
    chalk.hex("#ff4757").bold("🚀"),
    chalk.hex("#34ace0").bold(tokens.method(req, res)),
    chalk.hex("#fff")(tokens.url(req, res)),
    chalk.hex("#34ace0").bold(tokens.status(req, res)),
    chalk.hex("#2ed573").bold(tokens["response-time"](req, res) + " ms"),
  ].join(" ");
});

module.exports = loggerMiddleware;
