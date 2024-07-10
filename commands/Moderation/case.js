const {
  ActionRowBuilder,
  EmbedBuilder,
  ButtonBuilder,
  ButtonStyle,
  SlashCommandBuilder,
  PermissionFlagsBits
} = require('discord.js')
const ms = require('ms')

module.exports = {
  data: new SlashCommandBuilder()
    .setName('case')
    .setDescription('📃 View or Manage a Case')
    .addStringOption((option) => option
      .setName('case_id')
      .setDescription('📄 The member you would like to warn')
      .setRequired(true))
    .setDMPermission(false)
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),
  global: true,
  run: async (client, interaction) => {
    await interaction.deferReply()
    const caseId = interaction.options.getString('case_id')
    const data = client.db
      .get(`${interaction.guild.id}.moderations`)
      .filter((x) => x.caseId == caseId)
    if ((data && data.length == 0) || !data) {
      return interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setAuthor({
              name: 'Error',
              iconURL: interaction.guild.iconURL()
            })
            .setTimestamp()
            .setColor('Red')
            .setDescription(`${client.emotes.cross} Invalid Case ID`)
        ]
      })
    }

    const member = await client.users.fetch(data[0].member)
    const mod = await client.users.fetch(data[0].mod)
    const embed = new EmbedBuilder()
      .setAuthor({
        name: `📄 Case: ${caseId}`,
        iconURL: interaction.guild.iconURL()
      })
      .setFooter({
        text: `👤 Created by ${mod.username} (${mod.id})`,
        iconURL: mod.displayAvatarURL()
      })
      .setTimestamp(data[0].time)
      .setColor('Blurple')
      .setThumbnail(member.displayAvatarURL())
      .addFields(
        {
          name: '<:moderation:1196327170184847371> Case ID',
          value: `\`${data[0].caseId}\``,
          inline: false
        },
        {
          name: '<:moderate:1197504076712251462> Action',
          value: `\`${data[0].action}\``,
          inline: false
        },
        {
          name: '<:user:1197501497622147193> User',
          value: `${member.username} ( <@${member.id}> | \`${member.id}\`)`,
          inline: false
        },
        {
          name: '<:hammer:1197503912224239696> Reason',
          value: `${data[0].reason}`,
          inline: false
        },
        {
          name: '<:clock:1197503704501325855> Duration',
          value: `${
            data[0].duration
              ? ms(data[0].duration - data[0].time, {
                long: true
							  })
              : 'Permanant'
          }`,
          inline: false
        }
      )
    await interaction.editReply({
      embeds: [embed],
      components: [
        new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId(`edit-${caseId}`)
            .setLabel('Edit')
            .setStyle(ButtonStyle.Primary),

          new ButtonBuilder()
            .setCustomId(`del-${caseId}`)
            .setLabel('Delete')
            .setStyle(ButtonStyle.Danger)
        )
      ],
      fetchReply: true
    })

    setTimeout(() => {
      try {
        interaction.editReply({
          components: [
            new ActionRowBuilder().addComponents(
              new ButtonBuilder()
                .setCustomId(`edit-${caseId}`)
                .setLabel('Edit')
                .setEmoji('<:edit:1197501459869208576> ')
                .setDisabled(true)
                .setStyle(ButtonStyle.Primary),

              new ButtonBuilder()
                .setCustomId(`del-${caseId}`)
                .setLabel('Delete')
                .setEmoji('<:trash:1197505610862821416>')
                .setDisabled(true)
                .setStyle(ButtonStyle.Danger)
            )
          ]
        })
      } catch (e) {
        console.error(e)
      }
    }, 120000)
  }
}
