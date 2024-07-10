const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} = require('discord.js')

module.exports = {
  name: 'stat',
  userPermissions: ['Administrator'],
  cooldown: 4,
  aliases: ['s'],
  category: 'embeds',
  description: 'Show!',
  run: async (client, message, interaction) => {
    const embed = new EmbedBuilder()
      .setTitle('Stats')
      .setDescription(`🌐 **Servers**
Serving ${client.guilds.cache.size} servers.

📺 **Channels**
Serving ${client.channels.cache.size} channels.

👥 **Server Users**
Serving ${client.users.cache.size}`)
      .setColor('#2f3136')
    message.channel.send({
      embeds: [embed]
    })
  }
}
