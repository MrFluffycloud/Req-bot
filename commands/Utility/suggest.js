const {
  ActionRowBuilder,
  ButtonBuilder,
  SlashCommandBuilder,
  ButtonStyle,
  EmbedBuilder,
  blockQuote,
  hyperlink
} = require('discord.js')

module.exports = {
  data: new SlashCommandBuilder()
    .setName('suggest')
    .setDescription('💡 Suggest a suggestion to improve the server')
    .setDMPermission(false)
    .addStringOption((option) => option
      .setName('suggestion')
      .setDescription('💡 The suggestion you want to give.')
      .setRequired(true)),
  global: true,
  run: async (client, interaction) => {
    const suggestionChannelId = client.db.get(
      `${interaction.guild.id}.suggestion.channel`
    )

    const suggestionChannel = await interaction.guild.channels.fetch(
      suggestionChannelId
    )
    if (!suggestionChannel || !suggestionChannelId) {
      return await interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription(
              `${client.emotes.cross} Suggestion System is disabled.`
            )
            .setColor('Red')
        ],
        ephemeral: true
      })
    }

    const suggestion = interaction.options.getString('suggestion')

    const row = new ActionRowBuilder().addComponents([
      new ButtonBuilder({
        customId: 'suggestion-upvote',
        label: '0',
        style: ButtonStyle.Success,
        emoji: '<:thumbsup:1197509486622019654>'
      }),
      new ButtonBuilder({
        customId: 'suggestion-downvote',
        label: '0',
        style: ButtonStyle.Danger,
        emoji: '<:thumbsdown:1197509481882451968>'
      })
    ])

    suggestionChannel
      .send({
        components: [row],
        embeds: [
          new EmbedBuilder()
            .setTitle('New Suggestion!')
            .setAuthor({
              name: interaction.user.username,
              iconURL: interaction.user.displayAvatarURL()
            })
            .setColor('Blurple')
            .setDescription(blockQuote(suggestion))
            .setFooter({
              text: 'Status - Pending.. 📝'
            })
        ]
      })
      .then((msg) => {
        client.db.set(`${interaction.guild.id}.suggestions.${msg.id}`, {
          suggestion,
          user: interaction.user.id,
          message: msg.id,
          channel: suggestionChannel.id,
          guild: interaction.guildId,
          createdAt: Date.now(),
          url: msg.url
        })

        interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setColor('Green')
              .setDescription(
                `${client.emotes.tick} Suggestion ${hyperlink(
                  'Sent',
                  msg.url
                )}! Wait for review.`
              )
              .setTimestamp()
          ],
          ephemeral: true
        })
      })
  }
}
