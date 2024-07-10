const {
  EmbedBuilder,
  SlashCommandBuilder,
  PermissionFlagsBits
} = require('discord.js')

module.exports = {
  data: new SlashCommandBuilder()
    .setName('cases')
    .setDescription('📃 View or Manage a Case')
    .addUserOption((option) => option
      .setName('member')
      .setDescription('👤 Get cases of a certain user')
      .setRequired(false))
    .setDMPermission(false)
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),
  global: true,
  run: async (client, interaction) => {
    await interaction.deferReply()
    const user = interaction.options.getUser('member')
    let cases = client.db.get(`${interaction.guild.id}.moderations`)
      ? client.db.get(`${interaction.guild.id}.moderations`)
      : []
    if (!user) {
      if (cases.length == 0) {
        return interaction.editReply({
          embeds: [
            new EmbedBuilder()
              .setColor('Yellow')
              .setDescription("⚠️ There aren't any cases!")
          ]
        })
      }
      const embed = new EmbedBuilder()
        .setTitle(`${cases.length} case(s) Found`)
        .setColor('Blurple')
        .setDescription(
          `<:crvt:1196316646319595600> ${cases
            .map(
              (x) => `[${x.caseId}](https://discord.gg/aPBBrAJYsN) - ${x.reason}`
            )
            .join('\n<:crvt:1196316646319595600> ')}`
        )
      interaction.editReply({ embeds: [embed] })
    } else if (user) {
      cases = cases.filter((x) => x.member == user.id)
      if (cases.length == 0) {
        return interaction.editReply({
          embeds: [
            new EmbedBuilder()
              .setColor('Yellow')
              .setDescription(
                `⚠️ There aren't any cases against ${user.username}!`
              )
          ]
        })
      }
      const embed = new EmbedBuilder()
        .setTitle(
          `${cases.length} case(s) found against ${user.username}`
        )
        .setColor('Blurple')
        .setDescription(
          `<:crvt:1196316646319595600> ${cases
            .map(
              (x) => `[${x.caseId}](https://discord.gg/aPBBrAJYsN) - ${x.reason}`
            )
            .join('\n<:crvt:1196316646319595600> ')}`
        )
      interaction.editReply({ embeds: [embed] })
    }
  }
}
