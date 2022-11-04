const { Client, IntentsBitField, Partials } = require("discord.js");
const WOKCommands = require('wokcommands')
const path = require('path')
require('dotenv').config()

const client = new Client({
    intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.DirectMessages,
        IntentsBitField.Flags.MessageContent,
      ],
    partials: [Partials.Channel],
})

client.on('ready', () => {
    const dbOptions = {
        keepAlive: true,
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }

    new WOKCommands({
        client,
        commandsDir: path.join(__dirname, 'commands'),
        dbOptions,
        mongoUri: process.env.MONGO_URI
    })
})

client.login(process.env.TOKEN)