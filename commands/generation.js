const { CommandType } = require("wokcommands");
const { Configuration, OpenAIApi } = require("openai");

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

module.exports = {
  description: "Commande de génération d'image",

  type: CommandType.BOTH,
  minArgs: 1,

  callback: async ({ args }) => {
    console.log(args.join(" "));
    const result = await openai.createImage({
      prompt: args.join(" "),
      n: 1,
      size: "1024x1024",
    });
    const url = result.data.data[0].url;
    return url;
  },
};