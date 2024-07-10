const {
  Events,
  ActionRowBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  EmbedBuilder,
  ButtonBuilder,
  ButtonStyle
} = require('discord.js')

module.exports = {
  name: Events.InteractionCreate,
  once: false,
  async execute (interaction, client) {
    if (!interaction.isButton()) return
    const caseId = interaction.customId.split(/-/g)[1]

    if (interaction.customId.startsWith('edit-')) {
      const data = client.db
        .get(`${interaction.guild.id}.moderations`)
        .filter((x) => x.caseId == caseId)
      const modal = new ModalBuilder()
        .setCustomId(`edit_case-${caseId}`)
        .setTitle(`Edit Case: ${caseId}`)

      const NewReason = new TextInputBuilder()
        .setCustomId('reason')
        .setLabel('New Reason')
        .setValue(data[0].reason)
        .setRequired(true)
        .setStyle(TextInputStyle.Paragraph)

      const ac1 = new ActionRowBuilder().addComponents(NewReason)

      modal.addComponents(ac1)
      try {
        await interaction.showModal(modal)
      } catch (error) {
        console.error(error)
      }
    } else if (interaction.customId.startsWith('del-')) {
      try {
        await interaction.update({
          fetchReply: true,
          components: [
            new ActionRowBuilder().addComponents(
              new ButtonBuilder()
                .setCustomId(`edit-${caseId}`)
                .setLabel('Edit')
                .setDisabled(true)
                .setStyle(ButtonStyle.Secondary),

              new ButtonBuilder()
                .setCustomId(`del-${caseId}`)
                .setLabel('Delete')
                .setDisabled(true)
                .setStyle(ButtonStyle.Danger)
            )
          ]
        })
        client.db.pull(
          `${interaction.guild.id}.moderations`,
          (x) => x.caseId == caseId
        )
        await interaction.followUp({
          embeds: [
            new EmbedBuilder()
              .setAuthor({
                name: 'Success',
                iconURL: interaction.guild.iconURL()
              })
              .setDescription(
                `Successfully deleted case (\`${caseId}\`)!`
              )
              .setColor('Green')
              .setTimestamp()
          ],
          ephemeral: true
        })
      } catch (error) {
        console.log(error)
      }
    }
  }
}
