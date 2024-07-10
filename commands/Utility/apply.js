const {
  EmbedBuilder,
  SlashCommandBuilder,
  PermissionsBitField,
  ActionRowBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ChannelType
} = require('discord.js')

module.exports = {
  data: new SlashCommandBuilder()
    .setName('apply')
    .setDescription('📝 Apply for a form')
    .addStringOption((option) => option
      .setName('name')
      .setDescription('📄 The name of the Form')
      .setRequired(true)
      .setAutocomplete(true))
    .setDMPermission(false),
  global: true,
  async autocomplete (interaction, client) {
    const focusedValue = interaction.options.getFocused()
    const data = client.db.get('forms')
    const choices = data.map((x) => x.name)

    const filtered = choices.filter((choice) => choice.startsWith(focusedValue))

    await interaction.respond(
      filtered.map((choice) => ({
        name: choice,
        value: choice
      }))
    )
  },
  run: async (client, interaction) => {
    const formName = interaction.options.getString('name')

    const data = client.db.get('forms').filter((x) => x.name == formName)[0]
    if (!data) {
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription(
              `${client.emotes.cross} Questions for that form not found.`
            )
            .setColor('Red')
        ],
        ephemeral: true
      })
    }

    const modal = new ModalBuilder()
      .setCustomId(`apply-${formName}`)
      .setTitle(`Form for ${formName}`)

    data.questions.forEach((element) => {
      modal.addComponents(
        new ActionRowBuilder().addComponents(
          new TextInputBuilder()
            .setCustomId(
              `formQuestion-${data.questions.indexOf(element)}`
            )
            .setLabel(`${element}`)
            .setRequired(true)
            .setStyle(TextInputStyle.Short)
        )
      )
    })

    await interaction.showModal(modal)
  }
}
