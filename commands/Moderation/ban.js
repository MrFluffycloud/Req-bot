const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder,
  time
} = require('discord.js')
const ms = require('ms')

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ban')
    .setDescription('⚒️ Ban a user from this server!')
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
    .addUserOption((option) =>
      option
        .setName('user')
        .setDescription('👤 The user to be banned')
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName('reason')
        .setDescription('📄 The reason for the ban')
        .setRequired(false)
    )
    .addStringOption((option) =>
      option
        .setName('duration')
        .setDescription(
          '⌚ How long should the user be banned for? Skip if permanant'
        )
        .setRequired(false)
    ),
  global: true,
  run: async (client, interaction) => {
    await interaction.deferReply()

    const user = interaction.options.getUser('user')
    const reason =
			interaction.options.getString('reason') || 'Not provided.'
    const duration = interaction.options.getString('duration')

    if (!user) {
      return interaction.editReply({
        content: `${client.emotes.cross} Couldn't find such user in this guild`,
        ephemeral: true
      })
    }

    let member
    try {
      member = await interaction.guild.members.fetch(user.id)
    } catch {
      member = null
    }
    const errEmbed = new EmbedBuilder()
      .setDescription(
				`${client.emotes.cross} You can't take action on ${user.username} since they have a higher role.`
      )
      .setColor('Red')

    if (
      member &&
			member.roles.highest.position >=
				interaction.member.roles.highest.position
    ) {
      return interaction.editReply({
        embeds: [errEmbed],
        ephemeral: true
      })
    }

    const errEmbed1 = new EmbedBuilder()
      .setDescription(
				`${client.emotes.cross} I am unable to ban ${user.username}.`
      )
      .setColor('Red')

    if (member && !member.bannable) {
      return interaction.editReply({
        embeds: [errEmbed1],
        ephemeral: true
      })
    }

    if (duration && !fininte(duration)) {
      return interaction.editReply({
        content: `${client.emotes.cross} Invalid Time Format!!`,
        ephemeral: true
      })
    }

    const id = makeid(7)
    const embed = new EmbedBuilder()
      .setAuthor({
        name: user.username,
        iconURL: user.displayAvatarURL()
      })
      .setTitle('User Banned')
      .setDescription(
				`\`👤\` Successfully banned <@${user.id}> \`(${user.id})\` `
      )
      .addFields(
        {
          name: '<:hammer:1197503912224239696> Reason',
          value: reason,
          inline: true
        },
        {
          name: '<:moderate:1197504076712251462> Moderator',
          value: `${interaction.member} \`(${interaction.user.id})\``,
          inline: true
        },
        {
          name: '<:clock:1197503704501325855> Duration',
          value: `${
						duration && fininte(duration)
							? ms(fininte(duration), {
									long: true
							  })
							: 'Permanent'
					}`,
          inline: true
        }
      )
      .setTimestamp()
      .setColor('Red')
      .setFooter({
        text: `${interaction.guild.name} | Case ID: ${id}`,
        iconURL: interaction.guild.iconURL()
      })

    const dmEmbed = new EmbedBuilder()
      .setAuthor({
        name: interaction.guild.name,
        iconURL: interaction.guild.iconURL()
      })
      .addFields({ name: '<:hammer:1197503912224239696> Reason', value: reason, inline: true })
      .setTimestamp()
      .setDescription(
				`You have been banned from ${interaction.guild.name}`
      )
      .setColor('Red')
      .setFooter({
        text: `Case ID: ${id}`
      })

    const data = {
      member: user.id,
      mod: interaction.user.id,
      reason,
      caseId: id,
      action: 'Ban',
      time: Date.now()
    }

    if (duration && fininte(duration)) {
      data.duration = Date.now() + fininte(duration)
      dmEmbed.addFields({
        name: '<:clock:1197503704501325855> Expires',
        value: `${time(
					Math.round((Date.now() + fininte(duration)) / 1000),
					'R'
				)}`,
        inline: true
      })
    }

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

    if (await isBanned(interaction.guild, user.id)) {
      return await interaction.editReply({
        content: 'User is already banned',
        ephemeral: true
      })
    }

    try {
      try {
        await user.send({
          content: `<@${user.id}>`,
          embeds: [dmEmbed]
        })
        embed.addFields({
          name: '<:notification:1197504613889343559> Member Notified',
          value: 'True!',
          inline: true
        })
      } catch {
        embed.addFields({
          name: '<:notification:1197504613889343559> Member Notified',
          value: 'False',
          inline: true
        })
      }

      await interaction.guild.bans.create(user, {
        reason: `Banned - ${reason} - By ${interaction.user.id}`
      })

      client.db.push(`${interaction.guild.id}.moderations`, data)

      await interaction.editReply({ embeds: [embed], ephemeral: true })
      logChannel.send({ embeds: [embed] })
    } catch {
      await interaction.editReply("Couldn't ban the user!?")
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

function fininte (value) {
  try {
    return ms(value)
  } catch {
    return undefined
  }
}

function makeid (length) {
  let result = ''
  const characters =
		'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  const charactersLength = characters.length
  for (let i = 0; i < length; i++) {
    result += characters.charAt(
      Math.floor(Math.random() * charactersLength)
    )
  }
  return result
}
