const {
  EmbedBuilder,
  SlashCommandBuilder,
  PermissionFlagsBits
} = require('discord.js')
const ms = require('enhanced-ms')

module.exports = {
  data: new SlashCommandBuilder()
    .setName('multiplier')
    .setDescription('🎊 Giveaway Multiplier Config')
    .setDMPermission(false)
    .addSubcommand((subcommand) => subcommand
      .setName('add')
      .setDescription('➕ Add Multiplier to a role for giveaway')
      .addRoleOption((x) => x
        .setName('role')
        .setDescription(
          '📍 The role which you want to have multiplier on'
        )
        .setRequired(true))
      .addIntegerOption((x) => x
        .setName('multiplier')
        .setDescription(
          '🔢 Amount of Multiplier you want the role to have'
        )
        .setMaxValue(25)
        .setRequired(true)))
    .addSubcommand((subcommand) => subcommand
      .setName('remove')
      .setDescription('➖ Remove Multiplier from a role for giveaway')
      .addRoleOption((x) => x
        .setName('role')
        .setDescription(
          '📍 The role which you want to remove multiplier from'
        )
        .setRequired(true)))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
  global: true,
  run: async (client, interaction) => {
    switch (interaction.options.getSubcommand()) {
      case 'add':
        const role = interaction.options.getRole('role')
        const int = interaction.options.getInteger('multiplier')

        client.db.pull(
          `${interaction.guild.id}.giveaway.multi`,
          (element, index, array) => element.role == role.id,
          true
        )
        client.db.push(`${interaction.guild.id}.giveaway.multi`, {
          role: role.id,
          multi: int
        })

        interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setDescription(
                `${client.emotes.tick} ${role} now got ${int}x Multiplier`
              )
              .setColor('Green')
          ],
          ephemeral: true
        })

        break
      case 'remove':
        const rrole = interaction.options.getRole('role')
        client.db.pull(
          `${interaction.guild.id}.giveaway.multi`,
          (element, index, array) => element.role == rrole.id,
          true
        )

        interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setDescription(
                `${client.emotes.tick} Multiplier removed from ${rrole}, if existed`
              )
              .setColor('Green')
          ],
          ephemeral: true
        })
        break

      default:
        break
    }
  }
}
