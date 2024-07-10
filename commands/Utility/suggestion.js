const {
  SlashCommandBuilder,
  ChannelType,
  PermissionFlagsBits,
  EmbedBuilder,
  italic,
  blockQuote,
  ActionRowBuilder
} = require('discord.js')

module.exports = {
  data: new SlashCommandBuilder()
    .setName('suggestion')
    .setDescription('💡 Create or reply to suggestions')
    .setDMPermission(false)
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
    .addSubcommand((subcommand) => subcommand
      .setName('accept')
      .setDescription('✅ Accept a suggestion')
      .addStringOption((option) => option
        .setName('suggestion_id')
        .setDescription(
          '📄 The message id of the suggestion you plan to accept'
        )
        .setRequired(true))
      .addStringOption((option) => option
        .setName('reason')
        .setDescription(
          '📄 The reason for accepting the suggestion.'
        )
        .setMaxLength(1024)
        .setRequired(false)))
    .addSubcommand((subcommand) => subcommand
      .setName('consider')
      .setDescription('❓ Consider a suggestion')
      .addStringOption((option) => option
        .setName('suggestion_id')
        .setDescription(
          '📄 The message id of the suggestion you plan to consider '
        )
        .setRequired(true))
      .addStringOption((option) => option
        .setName('reason')
        .setDescription(
          '📄 The reason for considering the suggestion.'
        )
        .setMaxLength(1024)
        .setRequired(false)))
    .addSubcommand((subcommand) => subcommand
      .setName('reject')
      .setDescription('❌ Reject a suggestion')
      .addStringOption((option) => option
        .setName('suggestion_id')
        .setDescription(
          '📄 The message id of the suggestion you plan to reject'
        )
        .setRequired(true))
      .addStringOption((option) => option
        .setName('reason')
        .setDescription(
          '📄 The reason for denying the suggestion.'
        )
        .setMaxLength(1024)
        .setRequired(false)))
    .addSubcommand((subcommand) => subcommand
      .setName('channel')
      .setDescription('📍 Select the suggestion channel')
      .addChannelOption((option) => option
        .setName('channel')
        .setDescription(
          '📍 Set the suggestion channel, if unset suggestion module will be disabled'
        )
        .setRequired(false)
        .addChannelTypes(ChannelType.GuildText))),
  global: true,
  run: async (client, interaction) => {
    switch (interaction.options.getSubcommand()) {
      case 'channel':
        const suggestionChannel =					interaction.options.getChannel('channel')

        if (!suggestionChannel) {
          client.db.set(
            `${interaction.guild.id}.suggestion.channel`,
            false
          )
          return interaction.reply({
            embeds: [
              new EmbedBuilder()
                .setDescription(
                  `${client.emotes.tick} Suggestion System disabled.`
                )
                .setColor('Green')
            ],
            ephemeral: true
          })
        }

        client.db.set(
          `${interaction.guild.id}.suggestion.channel`,
          suggestionChannel.id
        )
        interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setDescription(
                `${client.emotes.tick} Suggestion channel set to ${suggestionChannel}.`
              )
              .setColor('Green')
          ],
          ephemeral: true
        })
        break
      case 'accept':
        const asuggestionId =					interaction.options.getString('suggestion_id')

        const adata = client.db.get(
          `${interaction.guild.id}.suggestions.${asuggestionId}`
        )

        const achannel = await interaction.guild.channels.fetch(
          adata.channel
        )
        if (!achannel) {
          return interaction.reply({
            ephemeral: true,
            embeds: [
              new EmbedBuilder()
                .setColor('Red')
                .setDescription(
                  `${client.emotes.cross} Channel the suggestion was sent is not found.`
                )
            ]
          })
        }
        const amsg = await achannel.messages.fetch(adata.message)

        const aembed = EmbedBuilder.from(amsg.embeds[0])
          .setColor('Green')
          .setFooter({
            text: 'Status - Accepted ✅'
          })

        const a = []
        amsg.components[0].components.forEach((x) => {
          x.data.disabled = true
          a.push(x)
        })

        const areason = interaction.options.getString('reason')

        if (areason) {
          aembed.addFields({
            name: 'Reason',
            value: `${italic(areason)}`
          })
        }

        amsg.edit({
          embeds: [aembed],
          content: `<@${adata.user}>`,
          components: [new ActionRowBuilder().setComponents(a)]
        })

        interaction.reply({
          ephemeral: true,
          embeds: [
            new EmbedBuilder()
              .setColor('Green')
              .setDescription(
                `${client.emotes.tick} Suggestion accepted${
                  areason
                    ? `, with reason:\n${blockQuote(
                      areason
										  )}`
                    : '.'
                }`
              )
          ]
        })

        break
      case 'consider':
        const csuggestionId =					interaction.options.getString('suggestion_id')

        const cdata = client.db.get(
          `${interaction.guild.id}.suggestions.${csuggestionId}`
        )

        const cchannel = await interaction.guild.channels.fetch(
          cdata.channel
        )
        if (!cchannel) {
          return interaction.reply({
            ephemeral: true,
            embeds: [
              new EmbedBuilder()
                .setColor('Red')
                .setDescription(
                  `${client.emotes.cross} Channel the suggestion was sent is not found.`
                )
            ]
          })
        }
        const cmsg = await cchannel.messages.fetch(cdata.message)

        const cembed = EmbedBuilder.from(cmsg.embeds[0])
          .setColor('Green')
          .setFooter({
            text: 'Status - Considered ⚠️'
          })

        const c = []
        cmsg.components[0].components.forEach((x) => {
          x.data.disabled = true
          c.push(x)
        })

        const creason = interaction.options.getString('reason')

        if (creason) {
          cembed.addFields({
            name: 'Reason',
            value: `${italic(creason)}`
          })
        }

        cmsg.edit({
          embeds: [cembed],
          content: `<@${cdata.user}>`,
          components: [new ActionRowBuilder().setComponents(c)]
        })

        interaction.reply({
          ephemeral: true,
          embeds: [
            new EmbedBuilder()
              .setColor('Yellow')
              .setDescription(
                `${
                  client.emotes.tick
                } Suggestion was put into consideration${
                  creason
                    ? `, with reason:\n${blockQuote(
                      creason
										  )}`
                    : '.'
                }`
              )
          ]
        })

        break
      case 'reject':
        const suggestionId =					interaction.options.getString('suggestion_id')

        const data = client.db.get(
          `${interaction.guild.id}.suggestions.${suggestionId}`
        )

        const channel = await interaction.guild.channels.fetch(
          data.channel
        )
        if (!channel) {
          return interaction.reply({
            ephemeral: true,
            embeds: [
              new EmbedBuilder()
                .setColor('Red')
                .setDescription(
                  `${client.emotes.cross} Channel the suggestion was sent is not found.`
                )
            ]
          })
        }
        const msg = await channel.messages.fetch(data.message)

        const embed = EmbedBuilder.from(msg.embeds[0])
          .setColor('Red')
          .setFooter({
            text: 'Status - Rejected ❌'
          })

        const r = []
        msg.components[0].components.forEach((x) => {
          x.data.disabled = true
          r.push(x)
        })

        const reason = interaction.options.getString('reason')

        if (reason) {
          embed.addFields({
            name: 'Reason',
            value: `${italic(reason)}`
          })
        }

        msg.edit({
          embeds: [embed],
          content: `<@${data.user}>`,
          components: [new ActionRowBuilder().setComponents(r)]
        })

        interaction.reply({
          ephemeral: true,
          embeds: [
            new EmbedBuilder()
              .setColor('Green')
              .setDescription(
                `${client.emotes.tick} Suggestion rejected${
                  reason
                    ? `, with reason:\n${blockQuote(
                      reason
										  )}`
                    : '.'
                }`
              )
          ]
        })

        break
      default:
        break
    }
  }
}
