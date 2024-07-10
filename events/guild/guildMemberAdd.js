const { EmbedBuilder, Events } = require('discord.js')

module.exports = {
  name: Events.GuildMemberAdd,
  once: false,
  async execute (member, client) {
    const enb = client.db.get(`${interaction.guild.id}.welcome.enabled`)

    if (!enb) return

    const chnlId = client.db.get(`${member.guild.id}.welcome.channel`)
    const memlog = client.db.get(`${member.guild.id}.memberlog.channel`)

    if (chnlId) {
      const welcomechannel = await member.guild.channels.fetch(chnlId)
      if (!welcomechannel) return

      const text = client.db.get(`${member.guild.id}.welcome.message`)
        ? client.db.get(`${member.guild.id}.welcome.message`)
        : `Welcome to ${member.guild.name}`

      const footer = client.db.get(`${member.guild.id}.welcome.footer`)
        ? client.db.get(`${member.guild.id}.welcome.footer`)
        : `You're the ${member.guild.memberCount}th member`

      const color = client.db.get(`${member.guild.id}.welcome.color`)
        ? client.db.get(`${member.guild.id}.welcome.color`)
        : '#2F3136'

      const embed = new EmbedBuilder()
        .setAuthor({
          name: `${member.user.username}`,
          iconURL: member.user.avatarURL()
        })
        .setTitle(`Welcome to ${member.guild.name}`)
        .setColor(color)
        .setDescription(
          `${text
            .replaceAll('{{guild}}', `${member.guild.name}`)
            .replaceAll('{{user}}', `${member.user.username}`)
            .replaceAll('{{userid}}', `${member.user.id}`)}`
        )
        .setFooter({
          text: footer
            .replaceAll('{{guild}}', `${member.guild.name}`)
            .replaceAll('{{user}}', `${member.user.username}`)
            .replaceAll('{{userid}}', `${member.user.id}`)
            .replaceAll('{{count}}', `${member.guild.memberCount}`),
          iconURL: client.user.avatarURL()
        })
      welcomechannel.send({ content: `${member}`, embeds: [embed] })
    }
    if (memlog) {
      const logchan = await member.guild.channels.fetch(memlog)
      if (!logchan) return

      const logembed = new EmbedBuilder()
        .setColor('Blurple')
        .setAuthor({
          name: `${member.user.username} (${member.user.id})`,
          iconURL: member.user.displayAvatarURL()
        })
        .setTitle('__New User Joined__')
        .setDescription(
          `> **Member:** \`${member.user.username}\` (${
            member.user.id
          }) \n> **User Since:** <t:${parseInt(
            member.user.createdTimestamp / 1000
          )}:R> \n> **Member Since:** <t:${parseInt(
            member.joinedTimestamp / 1000
          )}:R>`
        )
        .setTimestamp()
      logchan.send({ embeds: [logembed] })
    }
  }
}
