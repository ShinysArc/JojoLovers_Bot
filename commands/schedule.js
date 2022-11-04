const momentTimezone = require('moment-timezone')
const { CommandType } = require("wokcommands");
const { MessageCollector } = require('discord.js')

const scheduledSchema = require('../models/scheduled-schema')

module.exports =
{
  description: "Commande pour schedule des messages",
  // expectedArgs: '<Channel tag> <HH:MM> [DD/MM/YYYY] [Timezone]',
  minArgs: 2,
  maxArgs: 4,
  type: CommandType.BOTH,
  init: (client) => {
      const checkForPosts = async() => {
          const query = {
              date: {
                  $lte: Date.now()
              }
          }

          const results = await scheduledSchema.find(query)

          for (const post of results) {
              const { guildId, channelId, content } = post

              const guild = await client.guilds.fetch(guildId)
              if (!guild) {
                  continue
              }

              const channel = guild.channels.cache.get(channelId)
              if (!channel) {
                  continue
              }

              channel.send(content)
          }

          await scheduledSchema.deleteMany(query)

          setTimeout(checkForPosts, 1000 * 10)
      }

      checkForPosts()
  },
  callback: async ({ message, args }) => {
      const { mentions, guild, channel } = message

      const targetChannel = mentions.channels.first()
      if (!targetChannel) {
          message.reply('Veuillez tagger un channel')
          return
      }

      // Remove the channel tag from the args array
      args.shift()

      const [time, date, timeZone] = args

      if (timeZone) {
          const validTimeZones = momentTimezone.tz.names()
          if (!validTimeZones.includes(timeZone)) {
            message.reply('Timezone inconnue, veuillez utiliser une timezone parmi les suivantes: <https://gist.github.com/AlexzanderFlores/d511a7c7e97b4c3ae60cb6e562f78300>')
            return
          }
      }

      const timezoneToUse = timeZone ? timeZone : 'Europe/Paris'

      const today = new Date(Date.now()).toLocaleString().split(',')[0]

      const dateToUse = date ? date : today

      const targetDate = momentTimezone.tz(
          `${dateToUse} ${time}`,
          'DD-MM-YYYY HH:mm',
          timezoneToUse
      )

      message.reply('Veuillez entrer le message que vous voulez programmer.')

      const filter = (newMessage) => {
          return newMessage.author.id === message.author.id
      }

      const collector = channel.createMessageCollector({filter,
          max: 1,
          time: 1000 * 60 // 60 seconds
      })

      collector.on('end', async (collected) => {
          const collectedMessage = collected.first()

          if (!collectedMessage) {
              message.reply("Vous n'avez pas répondu à temps")
              return
          }

          message.reply('Votre message a été programmé')

          await new scheduledSchema({
              date: targetDate.valueOf(),
              content: collectedMessage.content,
              guildId: guild.id,
              channelId: targetChannel.id
          }).save()
      })
    }
}