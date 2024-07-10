const {
  Events,
  ActionRowBuilder,
  EmbedBuilder,
  ButtonBuilder,
  ButtonStyle,
  time,
  hyperlink
} = require('discord.js')

module.exports = {
  name: Events.InteractionCreate,
  once: false,
  async execute (interaction, client) {
    try {
      if (!interaction.isButton()) return

      if (interaction.customId.startsWith('giveaway')) {
        const data = client.db
          .get('giveaways')
          .filter((x) => x.messageId == interaction.message.id)

        if (!data || !data[0] || data[0].ended) {
          return interaction.reply({
            embeds: [
              new EmbedBuilder()
                .setColor('Yellow')
                .setDescription(
                  `${client.emotes.warning} Giveaway doesn\'t exist`
                )
            ],
            ephemeral: true
          })
        }

        const entry = client.db.get(
          `${interaction.guild.id}.giveaway.${interaction.message.id}.entry`
        )
        const blockedUsers =					client.db.get(
					  `${interaction.guild.id}.giveaway.blocklist`
        ) || []
        if (blockedUsers.includes(interaction.user.id)) {
          return interaction.reply({
            embeds: [
              new EmbedBuilder()
                .setColor('Red')
                .setDescription(
                  `${client.emotes.warning} You are blocked from participating in the giveaways`
                )
            ],
            ephemeral: true
          })
        }

        if (entry.includes(interaction.user.id)) {
          client.db.pull(
            `${interaction.guild.id}.giveaway.${interaction.message.id}.entry`,
            (element) => element == interaction.user.id,
            true
          )

          const entries = client.db.substr(
            `${interaction.guild.id}.giveaway.${interaction.message.id}.entered`,
            1
          )

          const embed = EmbedBuilder.from(
            interaction.message.embeds[0]
          ).setFields(
            {
              name: 'Ends',
              value: `${time(
                Math.round(data[0].endTime / 1000),
                'R'
              )}`,
              inline: true
            },
            {
              name: 'Hosted by',
              value: `<@${data[0].hostedBy}>`,
              inline: true
            }
          )

          const button = ActionRowBuilder.from(
            interaction.message.components[0]
          ).setComponents(
            new ButtonBuilder()
              .setCustomId('giveaway')
              .setEmoji('🎉')
              .setLabel(`Entries - ${entries}`)
              .setStyle(ButtonStyle.Primary)
          )
          interaction.message.edit({
            embeds: [embed],
            components: [button]
          })
          return interaction.reply({
            embeds: [
              new EmbedBuilder()
                .setColor('Red')
                .setDescription(
                  `${
                    client.emotes.warning
                  } You are no longer participating in the ${hyperlink(
                    'giveaway',
                    data[0].url
                  )}`
                )
            ],
            ephemeral: true
          })
        }

        const multi = client.db.get(
          `${interaction.guild.id}.giveaway.multi`
        )

        if (multi && multi.length > 0) {
          const multiroles = multi.map((x) => x.role)
          const rolehave = interaction.member.roles.cache.filter(
            (role) => multiroles.includes(role.id)
          )
          if (!rolehave || rolehave.size <= 0) {
            client.db.push(
              `${interaction.guild.id}.giveaway.${interaction.message.id}.entry`,
              interaction.user.id
            )
          } else {
            rolehave.forEach((x) => {
              const it = multi.find((rl) => rl.role == x.id)
              for (let index = 0; index < it.multi; index++) {
                client.db.push(
                  `${interaction.guild.id}.giveaway.${interaction.message.id}.entry`,
                  interaction.user.id
                )
              }
            })
          }
        } else {
          client.db.push(
            `${interaction.guild.id}.giveaway.${interaction.message.id}.entry`,
            interaction.user.id
          )
        }

        const entries = client.db.add(
          `${interaction.guild.id}.giveaway.${interaction.message.id}.entered`,
          1
        )

        const embed = EmbedBuilder.from(
          interaction.message.embeds[0]
        ).setFields(
          {
            name: 'Ends',
            value: `${time(
              Math.round(data[0].endTime / 1000),
              'R'
            )}`,
            inline: true
          },
          {
            name: 'Hosted by',
            value: `<@${data[0].hostedBy}>`,
            inline: true
          }
        )
        const button = ActionRowBuilder.from(
          interaction.message.components[0]
        ).setComponents(
          new ButtonBuilder()
            .setCustomId('giveaway')
            .setEmoji('🎉')
            .setLabel(`Entries - ${entries}`)
            .setStyle(ButtonStyle.Primary)
        )
        interaction.message.edit({
          embeds: [embed],
          components: [button]
        })
        interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setColor('Green')
              .setDescription(
                `${
                  client.emotes.tick
                } You are added to the ${hyperlink(
                  'giveaway',
                  data[0].url
                )}`
              )
          ],
          ephemeral: true
        })
      }
    } catch (e) {
      console.error(e)
    }
  }
}
