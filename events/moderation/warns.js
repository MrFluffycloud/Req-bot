const { Events, EmbedBuilder, time } = require('discord.js')
const ms = require('ms')

module.exports = {
  name: Events.ClientReady,
  once: false,
  async execute (client) {
    setInterval(async () => {
      const guilds = client.db.all()
      for (const value of guilds) {
        if (Object.hasOwn(value.data, 'moderations')) {
          const x = value.data.moderations
          const guildId = value.ID
          const guild = client.guilds.cache.get(guildId)
          x.forEach(async (data) => {
            if (!data.duration || isNaN(data.duration)) return
            if (data.action.toLowerCase() !== 'warn') return

            if (Date.now() > data.duration) {
              const member = await guild.members.fetch(
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

              const count =
								client.db
								  .get(`${guild.id}.moderations`)
								  .filter(
								    (a) =>
								      a.member == member.id &&
											a.action.toLowerCase() == 'warn'
								  )?.length || 0

              const embed = new EmbedBuilder()
                .setAuthor({
                  name: member.user.username,
                  iconURL: member.displayAvatarURL()
                })
                .setTitle('User Automatically unwarned')
                .setDescription(
									`\`👤\` Successfully unwarned ${member}\`(${member.id})\` `
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

              const dmEmbed = new EmbedBuilder()
                .setAuthor({
                  name: guild.name,
                  iconURL: guild.iconURL()
                })
                .addFields(
                  {
                    name: '<:hammer:1197503912224239696> Warning Reason',
                    value: data.reason,
                    inline: true
                  },
                  {
                    name: '<:crvt:1196316648433533068> Server',
                    value: guild.name,
                    inline: true
                  }
                )
                .setTimestamp()
                .setColor('Red')
                .setTitle('Warning Expired')
                .setDescription(
									`A warning issued ${
										data.time
											? time(
													Math.round(
														data.time / 1000
													),
													'R'
											  )
											: 'a while ago'
									}, was automatically removed due to expiring. You now have **${count} warnings**.`
                )
                .setColor('#7E51B7')
                .setFooter({
                  text: `Case ID: ${data.caseId}`
                })

              try {
                await member.send({
                  content: `<@${member.id}>`,
                  embeds: [dmEmbed]
                })
                embed.addFields({
                  name: '<:notification:1197504613889343559> Member Notified',
                  value: 'True!',
                  inline: true
                })
              } catch {
                embed.addFields({
                  name: '<:notification:1197504613889343559> Member Notified',
                  value: 'False',
                  inline: true
                })
              }

              logChannel.send({ embeds: [embed] })
            }
          })
        }
      }
    }, 5000)
  }
}
