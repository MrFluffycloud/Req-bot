const { Events, EmbedBuilder } = require('discord.js')
const ms = require('ms')

module.exports = {
  name: Events.ClientReady,
  once: false,
  async execute (client) {
    try {
      setInterval(async () => {
        const guilds = client.db.all()
        for (const value of guilds) {
          if (Object.hasOwn(value.data, 'moderations')) {
            const x = value.data.moderations
            const guildId = value.ID
            const guild = client.guilds.cache.get(guildId)
            x.forEach(async (data) => {
              if (!data.duration || isNaN(data.duration)) return
              if (data.action.toLowerCase() !== 'ban') return

              if (Date.now() > data.duration) {
                const member = await client.users.fetch(
                  data.member
                )
                client.db.pull(
                  `${guildId}.moderations`,
                  (element) => element.caseId === data.caseId,
                  true
                )

                const logChannelId = client.db.get(
                  `${guild.id}.config.logChannel`
                )
                if (!logChannelId) {
                  return console.error(
                    'Log Channel not Found, but user has been unbaned'
                  )
                }
                const logChannel = await guild.channels.fetch(
                  logChannelId
                )
                try {
                  await guild.bans.remove(member, {
                    reason: `Unbanned [Times Up] - ${data.reason} - By ${data.mod}`
                  })
                } catch (e) {
                  console.error(e)
                }

                const embed = new EmbedBuilder()
                  .setAuthor({
                    name: member.username,
                    iconURL: member.displayAvatarURL()
                  })
                  .setTitle('User Automatically unbanned')
                  .setDescription(
                    `\`👤\` Successfully unbanned ${member}\`(${member.id})\` `
                  )
                  .addFields(
                    {
                      name: '<:hammer:1197503912224239696> Reason',
                      value: data.reason,
                      inline: true
                    },
                    {
                      name: '<:moderate:1197504076712251462> Moderator',
                      value: `<@${data.mod}> \`(${data.mod})\``,
                      inline: true
                    },
                    {
                      name: '<:clock:1197503704501325855> Duration',
                      value: `${ms(
                        data.duration - data.time,
                        {
                          long: true
                        }
                      )}`,
                      inline: true
                    }
                  )
                  .setTimestamp()
                  .setColor('Red')
                  .setFooter({
                    text: `${guild.name} | Case ID: ${data.caseId}`,
                    iconURL: guild.iconURL()
                  })

                logChannel.send({ embeds: [embed] })
              }
            })
          }
        }
      }, 5000)
    } catch (e) {
      console.log(e)
    }
  }
}
