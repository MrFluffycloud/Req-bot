const { EmbedBuilder, Events } = require('discord.js')

module.exports = {
  name: Events.GuildMemberRemove,
  once: false,
  async execute (member, client) {
    const enb = client.db.get(`${interaction.guild.id}.leave.enabled`)

    if (!enb) return

    const chnlId = client.db.get(`${member.guild.id}.leave.channel`)
    const memlog = client.db.get(`${member.guild.id}.memberlog.channel`)

    if (chnlId) {
      const leavechannel = await member.guild.channels.fetch(chnlId)
      if (!leavechannel) return

      const text = client.db.get(`${member.guild.id}.leave.message`)
        ? client.db.get(`${member.guild.id}.leave.message`)
        : `User Left ${member.guild.name}`

      const footer = client.db.get(`${member.guild.id}.leave.footer`)
        ? client.db.get(`${member.guild.id}.leave.footer`)
        : `We now have ${member.guild.memberCount} members`

      const color = client.db.get(`${member.guild.id}.leave.color`)
        ? client.db.get(`${member.guild.id}.leave.color`)
        : '#2F3136'

      const embed = new EmbedBuilder()
        .setAuthor({
          name: `${member.user.username}`,
          iconURL: member.user.avatarURL()
        })
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
      leaveChannel.send({ embeds: [embed] }).then((embedMessage) => {
        embedMessage.react('👋')
      })
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
        .setTitle('__User Left__')
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
