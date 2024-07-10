const {
  EmbedBuilder,
  SlashCommandBuilder,
  PermissionFlagsBits
} = require('discord.js')

module.exports = {
  data: new SlashCommandBuilder()
    .setName('purge')
    .setDescription('🗑️ Deletes a specific number of messages.')
    .addNumberOption((option) => option
      .setName('amount')
      .setDescription('🔢 Select the number of messages to delete.')
      .setRequired(true)
      .setMinValue(1)
      .setMaxValue(100))
    .setDMPermission(false)
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
  global: true,
  run: async (client, interaction) => {
    const amount = interaction.options.getNumber('amount')

    const logChannelId = client.db.get(
      `${interaction.guild.id}.config.logChannel`
    )
    if (!logChannelId) {
      return interaction.reply({
        content:
					'⚠️ Log channel not found! Contact the admins to set it up!',
        ephemeral: true
      })
    }

    const logChannel = await interaction.guild.channels.fetch(logChannelId)

    if (!logChannel) {
      return interaction.reply({
        content:
					'⚠️ Log channel not found! Contact the admins to set it up!'
      })
    }

    const successembed = new EmbedBuilder()
      .setColor('Green')
      .setDescription(
        `${client.emotes.tick} Successfully purged \`${amount}\` messages!`
      )

    await interaction.channel.bulkDelete(amount, true)

    const logembed = new EmbedBuilder()
      .setColor('Blurple')
      .setAuthor({
        name: `${interaction.user.username} (${interaction.user.id})`,
        iconURL: interaction.user.displayAvatarURL({ dynamic: true })
      })
      .setDescription(
        `**<:user:1197501497622147193> Member:** \`${interaction.user.username}\` (${interaction.user.id}) \n**<:trash:1197505610862821416> Deleted:** \`${amount} messages\` \n**<:textchannel:1197507005661839402> Channel:** <#${interaction.channel.id}> \n**[Link!](https://discord.com/channels/${interaction.guild.id}/${interaction.channel.id})**`
      )
      .setTimestamp()
    logChannel.send({ embeds: [logembed] })

    return await interaction.reply({
      embeds: [successembed],
      ephemeral: true
    })
  }
}
