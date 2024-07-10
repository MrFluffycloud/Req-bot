const {
  Events,
  EmbedBuilder,
  time,
  ButtonStyle,
  ButtonBuilder,
  ActionRowBuilder,
  hyperlink
} = require('discord.js')

module.exports = {
  name: Events.ClientReady,
  once: false,
  async execute (client) {
    try {
      setInterval(async () => {
        const giveaways = (await client.db.get('giveaways')) || []
        giveaways.forEach(async (gw) => {
          if (gw.ended) return
          if (Date.now() >= gw.endTime) {
            const guild = client.guilds.cache.get(gw.guildId)
            if (!guild) return

            const channel = await guild.channels.fetch(
              gw.channelId
            )
            if (!channel) {
              return console.error(
                "I couldn't locate the channel",
                gw.channelId
              )
            }

            let msg
            try {
              msg = await channel.messages.fetch(gw.messageId)
            } catch {
              return console.error(
                'couldnt find the message',
                gw.messageId
              )
            }

            if (!msg) return

            const hehe = new ButtonBuilder()
              .setCustomId('giveaway')
              .setEmoji('🎉')
              .setDisabled(true)
              .setStyle(ButtonStyle.Secondary)
            msg.components[0].components[0].label
              ? hehe.setLabel(
                msg.components[0].components[0].label
							  )
              : null
            const dbtn = new ActionRowBuilder().addComponents(hehe)
            const eembed = EmbedBuilder.from(msg.embeds[0])
              .setFooter({
                text: `Giveaway Ended ${
									gw.forced ? 'Forcefully.' : ''
								}`
              })
              .setFields(
                {
                  name: 'Ended',
                  value: `${time(
										Math.round(Date.now() / 1000),
										'R'
									)}`,
                  inline: true
                },
                {
                  name: 'Hosted by',
                  value: `<@${gw.hostedBy}>`,
                  inline: true
                }
              )
              .setColor('Grey')

            const entry = client.db.get(
							`${gw.guildId}.giveaway.${gw.messageId}.entry`
            ) || 0

            if (entry.length <= 0) {
              eembed.addFields({
                name: 'Winners',
                value: 'None'
              })
              msg.reply({
                embeds: [
                  new EmbedBuilder()
                    .setColor('Grey')
                    .setDescription(
											`${
												client.emotes.warning
											} No one participated in the ${hyperlink(
												'giveaway',
												gw.url
											)}. No winners... `
                    )
                ]
              })
            } else {
              const shuffled = entry.sort(
                () => 0.5 - Math.random()
              )

              const selected = shuffled.slice(0, gw.winCount)

              client.db.set(
								`${gw.guildId}.giveaway.${gw.messageId}.winners`,
								selected
              )

              const winners = selected.map((x) => `<@${x}>`)

              eembed.addFields(
                {
                  name: 'Winners',
                  value: `${winners}`,
                  inline: true
                },
                {
                  name: 'Entries',
                  value: `${client.db.get(
										`${gw.guildId}.giveaway.${gw.messageId}.entered`
									)}`,
                  inline: true
                }
              )
              msg.reply({
                content: `${client.emotes.gift} ${winners.join(
									', '
								)}!`,
                embeds: [
                  new EmbedBuilder()
                    .setColor('Aqua')
                    .setAuthor({
                      name: 'Congratulations!'
                    })
                    .setDescription(
											`${
												winners.length > 1
													? 'Yall'
													: 'You'
											} have won the giveaway for ${hyperlink(
												gw.prize,
												gw.url
											)}`
                    )
                ]
              })
            }

            msg.edit({
              content: `${client.emotes.exclm} Giveaway Ended...`,
              embeds: [eembed],
              components: [dbtn]
            })

            data = client.db
              .get('giveaways')
              .filter((x) => x.messageId == gw.messageId)[0]

            data.ended = true

            client.db.pull(
              'giveaways',
              (element) => {
                return element.messageId == gw.messageId
              },
              true
            )

            client.db.push('giveaways', data)
          }
        })
      }, 5000)
    } catch (e) {
      console.error(e)
    }
  }
}
