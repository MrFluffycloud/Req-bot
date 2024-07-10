const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder
} = require('discord.js')

module.exports = {
  data: new SlashCommandBuilder()
    .setName('unban')
    .setDescription('💥 Unban a user from this server!')
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
    .addUserOption((option) =>
      option
        .setName('user')
        .setDescription('👤The user to be unbanned')
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName('reason')
        .setDescription('📄 The reason for the unban')
        .setRequired(false)
    ),
  global: true,
  run: async (client, interaction) => {
    await interaction.deferReply()

    const user = interaction.options.getUser('user')
    const reason =
			interaction.options.getString('reason') || 'Not Provided'

    if (!user) {
      return interaction.editReply({
        content: `${client.emotes.cross} Couldn't find such user in this guild`,
        ephemeral: true
      })
    }

    const data = client.db
      .get(`${interaction.guild.id}.moderations`)
      .filter((x) => x.user == user.id)[0]

    const embed = new EmbedBuilder()
      .setAuthor({
        name: user.username,
        iconURL: user.displayAvatarURL()
      })
      .setTitle('User Unbanned')
      .setDescription(
				`\`👤\` Successfully unbanned <@${user.id}>\`(${user.id})\` `
      )
      .addFields(
        { name: '<:hammer:1197503912224239696> Reason', value: reason, inline: true },
        {
          name: '<:moderate:1197504076712251462> Moderator',
          value: `${interaction.member} \`(${interaction.user.id})\``,
          inline: true
        }
      )
      .setTimestamp()
      .setColor('Red')
      .setFooter({
        text: `${interaction.guild.name} ${
					data?.caseId ? `| Case ID: ${data.caseId}` : ''
				}`,
        iconURL: interaction.guild.iconURL()
      })

    const logChannelId = client.db.get(
			`${interaction.guild.id}.config.logChannel`
    )

    if (!logChannelId) {
      return interaction.editReply({
        content:
					'Log channel not found! Contact the admins to set it up!',
        ephemeral: true
      })
    }
    const logChannel = await interaction.guild.channels.fetch(logChannelId)

    if (!logChannel) {
      return interaction.editReply({
        content:
					'Log channel not found! Contact the admins to set it up!',
        ephemeral: true
      })
    }

    if (!(await isBanned(interaction.guild, user.id))) {
      return await interaction.editReply({
        content: 'User is not banned',
        ephemeral: true
      })
    }

    try {
      await interaction.guild.bans.remove(user, {
        reason: `Unbanned - ${reason} - By ${interaction.user.id}`
      })

      client.db.pull(
				`${interaction.guild.id}.moderations`,
				(x) => x.user == user.id
      )

      await interaction.editReply({ embeds: [embed] })
      logChannel.send({ embeds: [embed] })
    } catch {
      await interaction.editReply("Couldn't unban the user!?")
    }
  }
}

async function isBanned (guild, id) {
  try {
    return await guild.bans.fetch(id)
  } catch (e) {
    return undefined
  }
}
