const {
  EmbedBuilder,
  SlashCommandBuilder,
  PermissionFlagsBits,
  time
} = require('discord.js')
const ms = require('ms')

module.exports = {
  data: new SlashCommandBuilder()
    .setName('warn')
    .setDescription('⚠️ Warn a Member')
    .addUserOption((option) =>
      option
        .setName('member')
        .setDescription('👤 The member you would like to warn')
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName('reason')
        .setDescription('📄 The reason to warn the user')
        .setRequired(false)
    )
    .addStringOption((option) =>
      option
        .setName('duration')
        .setDescription(
          '⌚ Give out a temporary warning? ex: `1h` for 1 hour'
        )
        .setRequired(false)
    )
    .setDMPermission(false)
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),
  global: true,
  run: async (client, interaction) => {
    await interaction.deferReply()
    const member = interaction.options.getMember('member')

    if (!member) {
      return interaction.editReply(
        "Couldn't find any such member in the guild!"
      )
    }

    const reason = interaction.options.getString('reason')
      ? interaction.options.getString('reason')
      : 'Not provided'

    const duration = interaction.options.getString('duration')

    if (duration && !fininte(duration)) {
      return interaction.editReply({
        content: 'Invalid Time Format!!',
        ephemeral: true
      })
    }
    const id = makeid(7)

    const embed = new EmbedBuilder()
      .setAuthor({
        name: member.user.username,
        iconURL: member.displayAvatarURL()
      })
      .setTitle('User Warned')
      .setDescription(
				`\`👤\` Successfully warned ${member}\`(${member.id})\` `
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
      .addFields({
        name: '<:hammer:1197503912224239696> Reason',
        value: reason,
        inline: true
      })
      .setTimestamp()
      .setColor('Red')
      .setTitle('You have been warned')
      .setFooter({
        text: `Case ID: ${id}`
      })

    const data = {
      member: member.id,
      mod: interaction.user.id,
      reason,
      caseId: id,
      action: 'Warn',
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
      return await interaction.editReply({
        content:
					'Log channel not found! Contact the admins to set it up!'
      })
    }

    client.db.push(`${interaction.guild.id}.moderations`, data)

    const count = client.db
      .get(`${interaction.guild.id}.moderations`)
      .filter(
        (x) => x.member == member.id && x.action.toLowerCase() == 'warn'
      )?.length

    dmEmbed.setDescription(`You is your ${ordinal(count)} warning`)

    try {
      await member.send({
        content: `<@${member.id}>`,
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

    logChannel.send({ embeds: [embed] })
    interaction.editReply({ embeds: [embed] })
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

function fininte (value) {
  try {
    return ms(value)
  } catch {
    return undefined
  }
}

function ordinal (i) {
  const j = i % 10
  const k = i % 100
  if (j == 1 && k != 11) {
    return i + 'st'
  }
  if (j == 2 && k != 12) {
    return i + 'nd'
  }
  if (j == 3 && k != 13) {
    return i + 'rd'
  }
  return i + 'th'
}
