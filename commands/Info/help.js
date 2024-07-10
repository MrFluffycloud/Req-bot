const {
  EmbedBuilder,
  SlashCommandBuilder,
  ButtonBuilder,
  ActionRowBuilder,
  ButtonStyle
} = require('discord.js')

const { PagesBuilder } = require('discord.js-pages')

module.exports = {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('List all of my commands.')
    .setDMPermission(false),
  global: true,
  run: async (client, interaction) => {
    const embed = new EmbedBuilder()
      .setDescription(
        '*Moderation is a unique bot that allows moderators and admins easy and reiable ways to moderate servers, custom giveaways, configuration, applications, and more!*'
      )
      .setImage(
        'https://media.discordapp.net/attachments/1148796384066162798/1196605537954058300/Untitled_4.png'
      )

    const mod = new EmbedBuilder()
      .setDescription(
        `## <:moderation:1196327170184847371> Moderation
</ban:1144085782152355923> \`-\` Ban any user upon the server or out of the server
</unban:1091563470929010777> \`-\` Unban a specific user from a server
</warn:1076668396906758263> \`-\` Warn someone for specific reason
</case:1144085782152355924> \`-\` View and manage a users case
</cases:1144085782152355925> \`-\` View a specfic users case or all cases`
      )
      .setImage(
        'https://cdn.discordapp.com/attachments/1148795961313865788/1189075720689954826/Untitled_2.png'
      )

    const config = new EmbedBuilder()
      .setDescription(
        `## <:config:1196327177755562075> Configuration
</config log_channel:1144085782152355928> \`-\` Set the log channel
</config memberlog_channel:1144085782152355928> \`-\` Set the member logging channel
</config welcome_channel:1144085782152355928> \`-\` Select the member welcome channel
</config welcome_msg:1144085782152355928> \`-\` Choose the welcome message
</config leave_channel:1144085782152355928> \`-\` Select the member leave channel
</config leave_msg:1144085782152355928> \`-\` Choose the leave message`
      )
      .setImage(
        'https://media.discordapp.net/attachments/1148796384066162798/1196605538323136522/Untitled_5.png'
      )

    const suggestions = new EmbedBuilder()
      .setDescription(
        `## <:suggestion:1196327173104091156> Suggestions 
</suggestion accept:1144085782320136285> \`-\` Accept a suggestion
</suggestion channel:1144085782320136285> \`-\` Set the suggestions channel
</suggestion consider:1144085782320136285> \`-\` Consider a suggestion
</suggestion reject:1144085782320136285> \`-\` Reject a suggestion
**10+ more commands!**`
      )
      .setImage(
        'https://media.discordapp.net/attachments/1148796384066162798/1196605538964865135/Untitled_7.png'
      )

    const gw = new EmbedBuilder()
      .setDescription(
        `## <:giveaways:1196327165550137384> Giveaway
</giveaway start:1144085782152355921> \`-\` Start a giveaway
</giveaway reroll:1144085782152355921> \`-\` Reroll an ended giveaway
</giveaway end:1144085782152355921> \`-\` End a specific giveaway
</multiplier add:1144085782152355922> \`-\` Add a specific role multiplier 
</multiplier remove:1144085782152355922> \`-\` Remove a specific role multiplier 
</blacklist add:1144085782152355920> \`-\` Blacklist a user from the giveaway system
</blacklist remove:1144085782152355920> \`-\` Remove a user from the blacklist system`
      )
      .setImage(
        'https://media.discordapp.net/attachments/1148796384066162798/1196605538641924236/Untitled_6.png'
      )

    new PagesBuilder(interaction)
      .setTitle('⁉️ Help Section')
      .setPages([embed, mod, config, gw, suggestions])
      .setFooter({
        text: `v${require('../../package.json').version}`,
        iconURL: client.user.displayAvatarURL()
      })
      .setAuthor({
        name: client.user.username,
        iconURL: client.user.displayAvatarURL()
      })
      .setURL(
        'https://discord.gg/aPBBrAJYsNapi/oauth2/authorize?client_id=1003320091242397706&permissions=1635791666295&scope=bot%20applications.commands'
      )
      .setColor('Blurple')
      .setListenEndMethod('delete')
      .setLoop(true)
      .setListenEndColor('Red')
      .setDefaultButtons([
        {
          first: new ButtonBuilder()
            .setEmoji('1196316647393349632')
            .setStyle(ButtonStyle.Secondary)
        },
        {
          back: new ButtonBuilder()
            .setEmoji('1196316645333946399')
            .setStyle(ButtonStyle.Primary)
        },
        {
          stop: new ButtonBuilder()
            .setEmoji('1196316643576533012')
            .setStyle(ButtonStyle.Danger)
        },
        {
          next: new ButtonBuilder()
            .setEmoji('1196316646319595600')
            .setStyle(ButtonStyle.Primary)
        },
        {
          last: new ButtonBuilder()
            .setEmoji('1196316648433533068')
            .setStyle(ButtonStyle.Secondary)
        }
      ])
      .build()
  }
}
