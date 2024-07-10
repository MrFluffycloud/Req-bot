const {
  Events,
  ActionRowBuilder,
  EmbedBuilder,
  ButtonBuilder,
  ButtonStyle
} = require('discord.js')

module.exports = {
  name: Events.InteractionCreate,
  once: false,
  async execute (interaction, client) {
    if (!interaction.isModalSubmit()) return

    if (interaction.customId.startsWith('edit_case-')) {
      const caseId = interaction.customId.split(/-/g)[1]
      await interaction.update({
        fetchReply: true,
        components: [
          new ActionRowBuilder().addComponents(
            new ButtonBuilder()
              .setCustomId(`edit-${caseId}`)
              .setLabel('Edit')
              .setEmoji('<:edit:1197501459869208576>')
              .setDisabled(true)
              .setStyle(ButtonStyle.Secondary),

            new ButtonBuilder()
              .setCustomId(`del-${caseId}`)
              .setLabel('Delete')
              .setEmoji('<:trash:1197505610862821416>')
              .setDisabled(true)
              .setStyle(ButtonStyle.Danger)
          )
        ]
      })
      const NewReason = interaction.fields.getTextInputValue('reason')
      const data = client.db
        .get(`${interaction.guild.id}.moderations`)
        .filter((x) => x.caseId == caseId)[0]

      const oldReason = data.reason
      await client.db.pull(
        `${interaction.guild.id}.moderations`,
        (x) => x.caseId == caseId
      )

      data.reason = NewReason
      await client.db.push(`${interaction.guild.id}.moderations`, data)

      await interaction.followUp({
        embeds: [
          new EmbedBuilder()
            .setColor('Blurple')
            .setDescription(`Updated Reason for Case \`${caseId}\``)
            .addFields(
              {
                name: '<:badges:1197501490995154954> Old Reason',
                value: oldReason,
                inline: true
              },
              {
                name: '<:hammer:1197503912224239696> New Rason',
                value: NewReason,
                inline: true
              }
            )
        ]
      })
    }
  }
}
