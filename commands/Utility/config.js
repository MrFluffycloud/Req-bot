const {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionFlagsBits,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ComponentType,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder
} = require('discord.js')

const path = require('path')

module.exports = {
  data: new SlashCommandBuilder()
    .setName('config')
    .setDescription('🔩 Configure the Bot')
    .setDefaultMemberPermissions(
      PermissionFlagsBits.ManageGuild || PermissionFlagsBits.Administrator
    ),
  cooldown: 2,
  category: 'config',
  global: false,
  ownerOnly: false,
  channelOnly: [],
  guilds: [],
  async run (client, interaction) {
    const ConfigEmbed = new EmbedBuilder()
      .setColor('Blurple')
      .setAuthor({
        name: `📐 ${client.user.username} Config`,
        iconURL: client.user.displayAvatarURL()
      })
      .setDescription('`🔩` Modify the bot settings. [Configure the bot]')
      .setThumbnail(client.user.displayAvatarURL())
      .addFields(
        {
          name: '`👋` Greet',
          value: 'Edit Welcome and Leave Settings',
          inline: true
        },
        {
          name: '`📥` Logs',
          value: 'Edit Logging Settings',
          inline: true
        },
        {
          name: '`👥` Staff',
          value: 'Edit Staff Settings',
          inline: true
        },
        {
          name: '`🛑` AD Mod',
          value: 'Edit the Advertisement Moderation Setting',
          inline: true
        }
      )
      .setTimestamp()
      .setFooter({
        text: interaction.guild.name,
        iconURL: interaction.guild.iconURL()
      })

    const ConfigRowBtns = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('config-greet')
        .setEmoji('👋')
        .setLabel('Greet')
        .setStyle(ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId('config-logs')
        .setEmoji('📥')
        .setLabel('Logs')
        .setDisabled(true)
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId('config-staff')
        .setEmoji('👥')
        .setLabel('Staff')
        .setDisabled(true)
        .setStyle(ButtonStyle.Secondary)
    )

    const ConfigRow = new ActionRowBuilder().addComponents(
      new StringSelectMenuBuilder()
        .setCustomId('config-menu')
        .setMaxValues(1)
        .setPlaceholder('Make a selection!')
        .addOptions(
          new StringSelectMenuOptionBuilder()
            .setEmoji('👋')
            .setLabel('Greet')
            .setDescription('Edit the Greet System Setting')
            .setValue('config-greet'),
          new StringSelectMenuOptionBuilder()
            .setEmoji('📥')
            .setLabel('Logs')
            .setDescription('Edit the Logs Setting')
            .setValue('config-logs'),
            new StringSelectMenuOptionBuilder()
              .setEmoji('👥')
              .setLabel('Staff')
              .setDescription('Edit the Staff System Setting')
              .setValue('config-staff'),
              new StringSelectMenuOptionBuilder()
                .setEmoji('🛑')
                .setLabel('AD Mod')
                .setDescription('Edit the Advertisement Moderation Setting')
                .setValue('config-admod')
        )
    )
    interaction.reply({
      embeds: [ConfigEmbed],
      components: [ConfigRow]
    })

    const filter = (i) => i.user.id === interaction.user.id && i.customId == 'config-menu'

    interaction.channel
      .awaitMessageComponent({
        filter,
        componentType: ComponentType.StringSelect,
        time: 60000
      })
      .then((int) => {
        const con = require(path.join('../../config/', int.values[0]))

        if (!con || !con.execute) return int.reply('No Options found')

        con.execute(int, client)
      })
      .catch((err) => {
        console.log(err)
        console.log('No interactions were collected.')
        return interaction.deleteReply()
      })
  }
}
