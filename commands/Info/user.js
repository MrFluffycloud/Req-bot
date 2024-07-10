const {
  EmbedBuilder,
  SlashCommandBuilder,
  time,
  ALLOWED_SIZES,
  UserFlags
} = require('discord.js')
UserFlags.HypeSquadOnlineHouse1
module.exports = {
  data: new SlashCommandBuilder()
    .setName('userinfo')
    .setDescription('❓ Get Details about users')
    .addUserOption((option) =>
      option
        .setName('user')
        .setDescription('👤 The user who you want info on.')
        .setRequired(false)
    )
    .setDMPermission(false),
  global: true,
  run: async (client, interaction) => {
    await interaction.deferReply()
    const user = interaction.options.getUser('user')
      ? interaction.options.getUser('user')
      : interaction.user

    const flags = {
      Staff: 'Staff',
      Partner: 'Partner',
      Hypesquad: 'Hypesquad',
      BugHunterLevel1: 'Bug Hunter',
      BugHunterLevel2: 'Bug Hunter 2',
      HypeSquadOnlineHouse1: 'Bravery',
      HypeSquadOnlineHouse2: 'Brilliance',
      HypeSquadOnlineHouse3: 'Balance',
      VerifiedDeveloper: 'Dev',
      CertifiedModerator: 'Mod',
      ActiveDeveloper: 'Active Dev'
    }

    const fuser = await user.fetch(true)
    const userFlags = user.flags.toArray()

    const embed = new EmbedBuilder()
      .setColor(fuser.hexAccentColor ? fuser.hexAccentColor : 'Blurple')
      .setTitle('👤 User Info')
      .setThumbnail(user.avatarURL({ forceStatic: false }))
      .addFields(
        {
          name: '<:user:1197501497622147193> User',
          value: `${user}`,
          inline: true
        },
        {
          name: '<:bot:1197501495319470171> Bot?',
          value: `\`${user.bot ? '✔️ Yes' : '❌ Nope'}\``,
          inline: true
        },
        {
          name: '<:badges:1197501490995154954> Badges',
          value: `${
						userFlags.length
							? userFlags.map((flag) => flags[flag]).join(', ')
							: 'None'
					}`,
          inline: true
        },
        {
          name: '<:joined:1197501480672960523> Joined Discord',
          value: `${time(
						Math.round(user.createdTimestamp / 1000),
						'R'
					)}`,
          inline: true
        }
      )
      .setFooter({
        text: `ID: ${user.id}`
      })

    const member = interaction.options.getMember('user')
      ? interaction.options.getMember('user')
      : interaction.member
    if (member && member.id == user.id) {
      embed.addFields(
        {
          name: '<:joindsc:1197501475014848512> Joined Server',
          value: `${time(
						Math.round(member.joinedTimestamp / 1000),
						'R'
					)}`,
          inline: true
        },
        {
          name: `<:roles:1197501469738409984> **[${member.roles.cache.size}]** Roles`,
          value:
						member.roles.cache.size < 25
						  ? Array.from(member.roles.cache.values())
						    .sort(
						      (a, b) => b.rawPosition - a.rawPosition
						    )
						    .map((role) => `${role}`)
						    .join(', ')
						  : member.roles.cache.size > 25
						    ? trimArray(member.roles.cache)
						    : 'None',
          inline: true
        },
        {
          name: '<:crown:1197501464688467968> Highest Role',
          value: `${member.roles.highest}`,
          inline: true
        },
        {
          name: '<:edit:1197501459869208576> Permissions',
          value: `${member.permissions
						.toArray()
						.map((p) => `\`${p}\``)
						.join(', ')}`,
          inline: false
        }
      )
    }

    const color = fuser.hexAccentColor?.slice(1)
    if (fuser.banner) {
      embed.setImage(
        fuser.bannerURL({ forceStatic: false, size: ALLOWED_SIZES[8] })
      )
    } else {
      embed.setImage(
				`https://via.placeholder.com/600x240/${color}.png?text=%E2%80%8B`
      )
    }
    await interaction.editReply({ embeds: [embed] })
  }
}

function trimArray (arr, maxLen = 25) {
  if (Array.from(arr.values()).length > maxLen) {
    const len = Array.from(arr.values()).length - maxLen
    arr = Array.from(arr.values())
      .sort((a, b) => b.rawPosition - a.rawPosition)
      .slice(0, maxLen)
    arr.map((role) => `<@&${role.id}>`)
    arr.push(`${len} more...`)
  }
  return arr.join(', ')
}
