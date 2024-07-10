const {
  Events,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder
} = require('discord.js')

module.exports = {
  name: Events.InteractionCreate,
  once: false,
  async execute (interaction, client) {
    if (!interaction.isButton()) return
    if (!interaction.customId.startsWith('suggestion')) return

    const cstmIds = interaction.customId.split(/-/g)
    const msgid = interaction.message.id

    if (cstmIds[1] == 'upvote') {
      if (
        client.db
          .get(`${interaction.guild.id}.suggestions.${msgid}.upvotes`)
          ?.includes(interaction.user.id)
      ) {
        return interaction.reply({
          ephemeral: true,
          embeds: [
            new EmbedBuilder()
              .setDescription(
								`${client.emotes.cross} You already upvoted for this`
              )
              .setColor('Red')
          ]
        })
      }

      const upvote = client.db.push(
				`${interaction.guild.id}.suggestions.${msgid}.upvotes`,
				interaction.user.id
      )
      const downvote = client.db.pull(
				`${interaction.guild.id}.suggestions.${msgid}.downvotes`,
				(element, index, array) => element == interaction.user.id,
				true
      )

      const upvotes = upvote ? upvote.length : '0'
      const downvotes = downvote ? downvote.length : '0'

      const comp = new ActionRowBuilder().setComponents([
        new ButtonBuilder({
          customId: 'suggestion-upvote',
          label: upvotes,
          style: ButtonStyle.Success,
          emoji: '👍'
        }),
        new ButtonBuilder({
          customId: 'suggestion-downvote',
          label: downvotes,
          style: ButtonStyle.Danger,
          emoji: '👎'
        })
      ])

      interaction.update({
        components: [comp]
      })
    } else if (cstmIds[1] == 'downvote') {
      if (
        client.db
          .get(`${interaction.guild.id}.suggestions.${msgid}.downvotes`)
          ?.includes(interaction.user.id)
      ) {
        return interaction.reply({
          ephemeral: true,
          embeds: [
            new EmbedBuilder()
              .setDescription(
								`${client.emotes.cross} You already downvotes for this`
              )
              .setColor('Red')
          ]
        })
      }

      const upvote = client.db.pull(
				`${interaction.guild.id}.suggestions.${msgid}.upvotes`,
				(element, index, array) => element == interaction.user.id,
				true
      )
      const downvote = client.db.push(
				`${interaction.guild.id}.suggestions.${msgid}.downvotes`,
				interaction.user.id
      )

      const downvotes = downvote ? downvote.length : '0'
      const upvotes = upvote ? upvote.length : '0'

      const comp = new ActionRowBuilder().setComponents([
        new ButtonBuilder({
          customId: 'suggestion-upvote',
          label: upvotes,
          style: ButtonStyle.Success,
          emoji: '👍'
        }),
        new ButtonBuilder({
          customId: 'suggestion-downvote',
          label: downvotes,
          style: ButtonStyle.Danger,
          emoji: '👎'
        })
      ])

      interaction.update({
        components: [comp]
      })
    }
  }
}
