const {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionsBitField
} = require('discord.js')

module.exports = {
  data: new SlashCommandBuilder()
    .setName('role')
    .setDescription('📍 Add/Remove a role to a member')
    .setDefaultMemberPermissions(PermissionsBitField.Flags.ManageRoles)
    .addSubcommand((subcommand) => subcommand
      .setName('add')
      .setDescription('➕ Add a role to member.')
      .addUserOption((option) => option
        .setName('member')
        .setDescription(
          '👤 The member who you want to add the role to.'
        )
        .setRequired(true))
      .addRoleOption((option) => option
        .setName('role')
        .setDescription(
          '📍 The role who you want to add the member to.'
        )
        .setRequired(true)))
    .addSubcommand((subcommand) => subcommand
      .setName('remove')
      .setDescription('➖ Remove a role to member.')
      .addUserOption((option) => option
        .setName('member')
        .setDescription(
          '👤 The member who you want to remove the role to.'
        )
        .setRequired(true))
      .addRoleOption((option) => option
        .setName('role')
        .setDescription(
          '📍 The role who you want to remove the member to.'
        )
        .setRequired(true))),
  global: true,
  run: async (client, interaction) => {
    switch (interaction.options.getSubcommand()) {
      case 'add':
        const amember = await interaction.options.getMember('member')
        const arole = await interaction.options.getRole('role')

        if (!amember) {
          return interaction.reply({
            embeds: [
              new EmbedBuilder()
                .setDescription(
                  `${client.emotes.cross} Invalid member / Member not found`
                )
                .setColor('Red')
            ]
          })
        }

        if (amember.roles.cache.some((role) => role.id === arole.id)) {
          return interaction.reply({
            embeds: [
              new EmbedBuilder()
                .setDescription(
                  `${client.emotes.cross} Member already have that role`
                )
                .setColor('Red')
            ]
          })
        }

        await amember.roles
          .add(arole)
          .then(async () => await interaction.reply({
            embeds: [
              new EmbedBuilder()
                .setDescription(
                  `${client.emotes.tick} Added ${arole} from ${amember}`
                )
                .setColor('Green')
            ]
          }))
          .catch(async (err) => {
            console.error(err)
            return await interaction.reply({
              embeds: [
                new EmbedBuilder()
                  .setDescription(
                    `${client.emotes.cross} Couldn't add role`
                  )
                  .setColor('Red')
              ]
            })
          })

        break

      case 'remove':
        const rmember = await interaction.options.getMember('member')
        const rrole = await interaction.options.getRole('role')

        if (!rmember) {
          return interaction.reply({
            embeds: [
              new EmbedBuilder()
                .setDescription(
                  `${client.emotes.cross} Invalid member / Member not found`
                )
                .setColor('Red')
            ]
          })
        }

        if (!rmember.roles.cache.some((role) => role.id === rrole.id)) {
          return interaction.reply({
            embeds: [
              new EmbedBuilder()
                .setDescription(
                  `${client.emotes.cross} Member doesn't have that role`
                )
                .setColor('Red')
            ]
          })
        }

        await rmember.roles
          .remove(rrole)
          .then(async () => await interaction.reply({
            embeds: [
              new EmbedBuilder()
                .setDescription(
                  `${client.emotes.tick} Removed ${rrole} from ${rmember}`
                )
                .setColor('Green')
            ]
          }))
          .catch(async (err) => {
            console.error(err)
            return await interaction.reply({
              embeds: [
                new EmbedBuilder()
                  .setDescription(
                    `${client.emotes.cross} Couldn't remove role`
                  )
                  .setColor('Red')
              ]
            })
          })

        break
    }
  }
}
