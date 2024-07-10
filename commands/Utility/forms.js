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
    .setName('forms')
    .setDescription('📝 Create and delete a form')
    .setDefaultMemberPermissions(PermissionsBitField.Flags.ManageGuild)
    .addSubcommand((subcommand) => subcommand
      .setName('create')
      .setDescription('➕ Create a Form')
      .addStringOption((option) => option
        .setName('name')
        .setDescription(
          '📄 The form name, Using same name creates duplicates. (No Whitespace)'
        )
        .setRequired(true))
      .addChannelOption((option) => option
        .setName('channel')
        .setDescription('📍 The response channel')
        .addChannelTypes(ChannelType.GuildText)
        .setRequired(true)))
    .addSubcommand((subcommand) => subcommand
      .setName('delete')
      .setDescription('➖ Delete a form')
      .addStringOption((option) => option
        .setName('name')
        .setDescription('📄 The form name')
        .setRequired(true)))
    .setDMPermission(false),
  global: true,
  run: async (client, interaction) => {
    if (interaction.options.getSubcommand() === 'create') {
      const formName = interaction.options
        .getString('name')
        .replaceAll(' ', '_')
      const channel = interaction.options.getChannel('channel')

      const modal = new ModalBuilder()
        .setCustomId(`forms-${formName}`)
        .setTitle(`Forms for ${formName}`)

      const questions1 = new ActionRowBuilder().addComponents(
        new TextInputBuilder()
          .setCustomId('formQuestion1')
          .setLabel('Question 1:')
          .setMaxLength(256)
          .setRequired(true)
          .setStyle(TextInputStyle.Short)
      )
      const questions2 = new ActionRowBuilder().addComponents(
        new TextInputBuilder()
          .setCustomId('formQuestion2')
          .setLabel('Question 2:')
          .setMaxLength(256)
          .setRequired(false)
          .setStyle(TextInputStyle.Short)
      )
      const questions3 = new ActionRowBuilder().addComponents(
        new TextInputBuilder()
          .setCustomId('formQuestion3')
          .setLabel('Question 3:')
          .setMaxLength(256)
          .setRequired(false)
          .setStyle(TextInputStyle.Short)
      )
      const questions4 = new ActionRowBuilder().addComponents(
        new TextInputBuilder()
          .setCustomId('formQuestion4')
          .setLabel('Question 4:')
          .setMaxLength(256)
          .setRequired(false)
          .setStyle(TextInputStyle.Short)
      )
      const questions5 = new ActionRowBuilder().addComponents(
        new TextInputBuilder()
          .setCustomId('formQuestion5')
          .setLabel('Question 5:')
          .setMaxLength(256)
          .setRequired(false)
          .setStyle(TextInputStyle.Short)
      )

      modal.addComponents(
        questions1,
        questions2,
        questions3,
        questions4,
        questions5
      )

      await interaction.showModal(modal)

      client.db.set(`${interaction.guild.id}.frms.${formName}`, channel.id)
    } else if (interaction.options.getSubcommand() === 'delete') {
      const formName = interaction.options
        .getString('name')
        .replaceAll(' ', '_')

      client.db.pull(
        `${interaction.guild.id}.forms`,
        (element, index, array) => element.name == formName,
        true
      )

      interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription(
              `${client.emotes.tick} Deleted forms of that name.`
            )
            .setColor('Green')
        ],
        ephemeral: true
      })
    }
  }
}
