const { CommandType } = require("wokcommands");

module.exports = {
  description: "Ping pong command",

  type: CommandType.BOTH,

  callback: () => {
    return {
      content: "Pong!",
    };
  },
};