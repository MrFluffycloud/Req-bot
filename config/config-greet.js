const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ComponentType,
  ChannelType,
  ChannelSelectMenuBuilder,
  codeBlock,
  bold
} = require('discord.js')
const { PagesBuilder } = require('discord.js-pages')

module.exports = {
  async execute (interaction, client) {
    const reply = await interaction.deferUpdate()

    const guildId = interaction.guild.id

    let welcomeConfig = client.db.get(`${guildId}.welcome`) || {}
    let leaveConfig = client.db.get(`${guildId}.leave`) || {}

    const genEmbed = () => {
      welcomeConfig = client.db.get(`${guildId}.welcome`) || {}
      leaveConfig = client.db.get(`${guildId}.leave`) || {}

      const color = welcomeConfig.color || '#2F3136'
      const welcomeChannel = welcomeConfig.channel
        ? `<#${welcomeConfig.channel}>`
        : 'Not Set'
      const welcomeMessage =				welcomeConfig.message || 'Welcome to {{guild}}'
      const welcomeFooter =				welcomeConfig.footer || 'You\'re the {{count}}th member'

      const leaveChannel = leaveConfig.channel
        ? `<#${leaveConfig.channel}>`
        : 'Not Set'
      const leaveMessage = leaveConfig.message || 'User Left {{guild}}'
      const leaveFooter =				leaveConfig.footer || 'We now have {{count}} members'

      return new EmbedBuilder()
        .setColor(color)
        .setDescription('`👋` Greet Settings')
        .setThumbnail(client.user.displayAvatarURL())
        .addFields(
          {
            name: `Welcome Settings \`[${
              welcomeConfig.enabled ? 'Enabled' : 'Disabled'
            }]\``,
            value: '\u200B',
            inline: false
          },
          {
            name: '<:crvt:1196316646319595600> Welcome Channel',
            value: welcomeChannel,
            inline: true
          },
          {
            name: '<:crvt:1196316646319595600> Welcome Message',
            value: welcomeMessage,
            inline: true
          },
          {
            name: '<:crvt:1196316646319595600> Welcome Color',
            value: color,
            inline: true
          },
          {
            name: '<:crvt:1196316646319595600> Welcome Footer',
            value: welcomeFooter,
            inline: true
          }
        )
        .addFields(
          {
            name: `Leave Settings \`[${
              leaveConfig.enabled ? 'Enabled' : 'Disabled'
            }]\``,
            value: '\u200B',
            inline: false
          },
          {
            name: '<:crvt:1196316646319595600> Leave Channel',
            value: leaveChannel,
            inline: true
          },
          {
            name: '<:crvt:1196316646319595600> Leave Message',
            value: leaveMessage,
            inline: true
          },
          {
            name: '<:crvt:1196316646319595600> Leave Color',
            value: color,
            inline: true
          },
          {
            name: '<:crvt:1196316646319595600> Leave Footer',
            value: leaveFooter,
            inline: true
          }
        )
        .setTimestamp()
        .setFooter({
          text: interaction.guild.name,
          iconURL: interaction.guild.iconURL()
        })
    }

    const WtoggleButtonText = welcomeConfig.enabled ? 'Disable' : 'Enable'
    const WtoggleButtonStyle = welcomeConfig.enabled ? 'Danger' : 'Success'
    const LtoggleButtonText = leaveConfig.enabled ? 'Disable' : 'Enable'
    const LtoggleButtonStyle = leaveConfig.enabled ? 'Danger' : 'Success'

    const optionRowWlcm = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('config-wlcmtoggle')
        .setLabel(WtoggleButtonText)
        .setStyle(WtoggleButtonStyle),
      new ButtonBuilder()
        .setCustomId('config-wlcmchannel')
        .setLabel('Welcome Channel')
        .setStyle('Primary'),
      new ButtonBuilder()
        .setCustomId('config-wlcmmessage')
        .setLabel('Welcome Message')
        .setStyle('Secondary'),
      new ButtonBuilder()
        .setCustomId('config-wlcmcolor')
        .setLabel('Welcome Color')
        .setStyle('Primary'),
      new ButtonBuilder()
        .setCustomId('config-wlcmfooter')
        .setLabel('Welcome Footer')
        .setStyle('Secondary')
    )

    const optionRowLeave = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('config-leavetoggle')
        .setLabel(LtoggleButtonText)
        .setStyle(LtoggleButtonStyle),
      new ButtonBuilder()
        .setCustomId('config-leavechannel')
        .setLabel('Leave Channel')
        .setStyle('Secondary'),
      new ButtonBuilder()
        .setCustomId('config-leavemessage')
        .setLabel('Leave Message')
        .setStyle('Primary'),
      new ButtonBuilder()
        .setCustomId('config-leavecolor')
        .setLabel('Leave Color')
        .setStyle('Secondary'),
      new ButtonBuilder()
        .setCustomId('config-leavefooter')
        .setLabel('Leave Footer')
        .setStyle('Primary')
    )
    const embed = genEmbed()
    new PagesBuilder(interaction)
      .setPages([embed])
      .setComponents([optionRowWlcm, optionRowLeave])
      .setDefaultButtons([])
      .setTriggers([
        {
          name: 'config-wlcmtoggle',
          callback (interactionCallback, button) {
            const guildId = interaction.guild.id
            const welcomeConfig =							client.db.get(`${guildId}.welcome`) || {}

            welcomeConfig.enabled = !welcomeConfig.enabled

            client.db.set(`${guildId}.welcome`, welcomeConfig)

            const toggleButtonText = welcomeConfig.enabled
              ? 'Disable'
              : 'Enable'
            const toggleButtonStyle = welcomeConfig.enabled
              ? 'Danger'
              : 'Success'
            button.setLabel(toggleButtonText)
            button.setStyle(toggleButtonStyle)
            const embed = genEmbed()
            reply.edit({
              components: [optionRowWlcm, optionRowLeave],
              embeds: [embed]
            })
            interaction.followUp({
              embeds: [
                new EmbedBuilder()
                  .setDescription(
                    `${
                      client.emotes.tick
                    } Welcome messages are now **${
                      welcomeConfig.enabled
                        ? `Enabled ${client.emotes.tick}`
                        : `Disabled ${client.emotes.cross}`
                    }**.`
                  )
                  .setColor('Green')
              ],
              ephemeral: true
            })
          }
        },
        {
          name: 'config-wlcmchannel',
          callback (interactionCallback, button) {
            const transactionsChannelSelect =							new ChannelSelectMenuBuilder()
              .setCustomId('wlcmchannelselect')
              .setPlaceholder(
                'Please Select the Welcome Channel.'
              )
							  .setMinValues(1)
              .setMaxValues(1)
              .setChannelTypes(ChannelType.GuildText)

            const firstRow = new ActionRowBuilder().addComponents(
              transactionsChannelSelect
            )

            interaction
              .followUp({
                embeds: [
                  new EmbedBuilder()
                    .setDescription(
                      '<:crvt:1196316646319595600> Select the Welcome Channel from the Options Below'
                    )
                    .setColor('Green')
                ],
                components: [firstRow],
                fetchReply: true,
                ephemeral: true
              })
              .then(() => {
                const filter = (i) => (
                  i.user.id === interaction.user.id &&
										i.customId == 'wlcmchannelselect'
                )

                interaction.channel
                  .awaitMessageComponent({
                    filter,
                    componentType:
											ComponentType.ChannelSelect,
                    time: 60000
                  })
                  .then((int) => {
                    const WlcmChannel = int.values[0]

                    if (!WlcmChannel) {
                      client.db.set(
                        `${interaction.guild.id}.welcome.channel`,
                        false
                      )
                      return int.reply({
                        embeds: [
                          new EmbedBuilder()
                            .setDescription(
                              `${client.emotes.tick} Welcome System disabled.`
                            )
                            .setColor('Green')
                        ],
                        ephemeral: true
                      })
                    }

                    client.db.set(
                      `${interaction.guild.id}.welcome.channel`,
                      WlcmChannel
                    )
                    int.reply({
                      embeds: [
                        new EmbedBuilder()
                          .setDescription(
                            `${client.emotes.tick} Welcome channel set to <#${WlcmChannel}>.`
                          )
                          .setColor('Green')
                      ],
                      ephemeral: true
                    })
                  })
                  .catch((err) => interaction.editReply({
                    ephemeral: true,
                    embeds: [
                      new EmbedBuilder()
                        .setColor('Red')
                        .setDescription(
                          `${client.emotes.cross} Looks like I didn't recive anything..`
                        )
                    ]
                  }))
                const embed = genEmbed()
                reply.edit({
                  components: [optionRowWlcm, optionRowLeave],
                  embeds: [embed]
                })
              })
          }
        },
        {
          name: 'config-wlcmmessage',
          callback (interactionCallback, button) {
            interaction
              .followUp({
                embeds: [
                  new EmbedBuilder()
                    .setColor('Blurple')
                    .setDescription(
                      `<:crvt:1196316646319595600> Send The Content for the Welcome message in the channel\n\n${bold(
                        'Variables'
                      )}\n- \`{{guild}}\` - Returns The Guild Name \n- \`{{user}}\` - Returns Member Mention \n- \`{{userid}}\` - Returns the Member's ID`
                    )
                ],
                ephemeral: true,
                fetchReply: true
              })
              .then(() => {
                const filter = (i) => i.author.id === interaction.user.id
                interaction.channel
                  .awaitMessages({
                    filter,
                    max: 1,
                    time: 30000,
                    errors: ['time']
                  })
                  .then((collected) => {
                    interaction.followUp({
                      embeds: [
                        new EmbedBuilder()
                          .setColor('Green')
                          .setDescription(
                            `${
                              client.emotes.tick
                            } New Welcome Message Set\n\n${codeBlock(
                              collected.first()
                                .content
                            )}`
                          )
                      ],
                      ephemeral: true
                    })

                    client.db.set(
                      `${interaction.guild.id}.welcome.message`,
                      collected.first().content
                    )

                    setTimeout(() => {
                      collected.first().delete()
                    }, 3000)
                  })
                  .catch((collected) => {
                    interaction.followUp({
                      embeds: [
                        new EmbedBuilder()
                          .setColor('Red')
                          .setDescription(
                            `${client.emotes.cross} Looks like I didn't recive anything..`
                          )
                      ],
                      ephemeral: true
                    })
                  })

                const embed = genEmbed()
                reply.edit({
                  components: [optionRowWlcm, optionRowLeave],
                  embeds: [embed]
                })
              })
          }
        },
        {
          name: 'config-wlcmcolor',
          callback (interactionCallback, button) {
            interaction
              .followUp({
                embeds: [
                  new EmbedBuilder()
                    .setColor('Blurple')
                    .setDescription(
                      '<:crvt:1196316646319595600> Send The Hex Code of the color you want in the Welcome Embeds in this channel'
                    )
                ],
                ephemeral: true,
                fetchReply: true
              })
              .then(() => {
                const filter = (i) => i.author.id === interaction.user.id
                interaction.channel
                  .awaitMessages({
                    filter,
                    max: 1,
                    time: 30000,
                    errors: ['time']
                  })
                  .then((collected) => {
                    const colorCode =											collected.first().content
                    const isValidHex =											/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(
                      colorCode
                    )

                    if (isValidHex) {
                      interaction.followUp({
                        embeds: [
                          new EmbedBuilder()
                            .setColor(
                              colorCode || 'Aqua'
                            )
                            .setDescription(
                              `<:crvt:1196316646319595600> **${colorCode}** will be the new welcome color`
                            )
                        ],
                        ephemeral: true
                      })

                      client.db.set(
                        `${interaction.guild.id}.welcome.color`,
                        colorCode
                      )

                      setTimeout(() => {
                        collected.first().delete()
                      }, 3000)
                    } else {
                      interaction.followUp({
                        embeds: [
                          new EmbedBuilder()
                            .setColor('Red')
                            .setDescription(
                              `${client.emotes.cross} The message sent is not a valid color code.`
                            )
                        ],
                        ephemeral: true
                      })
                    }
                  })
                  .catch((collected) => {
                    interaction.followUp({
                      embeds: [
                        new EmbedBuilder()
                          .setColor('Red')
                          .setDescription(
                            `${client.emotes.cross} Looks like I didn't recive anything..`
                          )
                      ],
                      ephemeral: true
                    })
                  })

                const embed = genEmbed()
                reply.edit({
                  components: [optionRowWlcm, optionRowLeave],
                  embeds: [embed]
                })
              })
          }
        },
        {
          name: 'config-wlcmfooter',
          callback (interactionCallback, button) {
            interaction
              .followUp({
                ephemeral: true,
                embeds: [
                  new EmbedBuilder()
                    .setColor('Blurple')
                    .setDescription(
                      `<:crvt:1196316646319595600> Send the Content for the welcome footer here\n\n${bold(
                        'Variables'
                      )}\n- \`{{guild}}\` - Returns The Guild Name \n- \`{{user}}\` - Returns Member Mention \n- \`{{userid}}\` - Returns the Member's ID \n- \`{{count}}\` - Returns the Guild's Member Count`
                    )
                ],
                fetchReply: true
              })
              .then(() => {
                const filter = (i) => i.author.id === interaction.user.id
                interaction.channel
                  .awaitMessages({
                    filter,
                    max: 1,
                    time: 30000,
                    errors: ['time']
                  })
                  .then((collected) => {
                    interaction.followUp({
                      embeds: [
                        new EmbedBuilder()
                          .setColor('Green')
                          .setDescription(
                            `${
                              client.emotes.tick
                            } New Footer Set\n\n${codeBlock(
                              collected.first()
                                .content
                            )}`
                          )
                      ],
                      ephemeral: true
                    })

                    client.db.set(
                      `${interaction.guild.id}.welcome.footer`,
                      collected.first().content
                    )

                    setTimeout(() => {
                      collected.first().delete()
                    }, 3000)
                  })
                  .catch((collected) => {
                    interaction.followUp({
                      embeds: [
                        new EmbedBuilder()
                          .setColor('Red')
                          .setDescription(
                            `${client.emotes.cross} Looks like I didn't recive anything..`
                          )
                      ],
                      ephemeral: true
                    })
                  })

                const embed = genEmbed()
                reply.edit({
                  components: [optionRowWlcm, optionRowLeave],
                  embeds: [embed]
                })
              })
          }
        },

        // leave

        {
          name: 'config-leavetoggle',
          callback (interactionCallback, button) {
            const guildId = interaction.guild.id
            const leaveConfig =							client.db.get(`${guildId}.leave`) || {}

            leaveConfig.enabled = !leaveConfig.enabled

            client.db.set(`${guildId}.leave`, leaveConfig)

            const toggleButtonText = leaveConfig.enabled
              ? 'Disable'
              : 'Enable'
            const toggleButtonStyle = leaveConfig.enabled
              ? 'Danger'
              : 'Success'
            button.setLabel(toggleButtonText)
            button.setStyle(toggleButtonStyle)

            const embed = genEmbed()
            reply.edit({
              components: [optionRowWlcm, optionRowLeave],
              embeds: [embed]
            })
            interaction.followUp({
              embeds: [
                new EmbedBuilder()
                  .setDescription(
                    `${
                      client.emotes.tick
                    } leave messages are now **${
                      leaveConfig.enabled
                        ? `Enabled ${client.emotes.tick}`
                        : `Disabled ${client.emotes.cross}`
                    }**.`
                  )
                  .setColor('Green')
              ],
              ephemeral: true
            })
          }
        },
        {
          name: 'config-leavechannel',
          callback (interactionCallback, button) {
            const transactionsChannelSelect =							new ChannelSelectMenuBuilder()
              .setCustomId('leavechannelselect')
              .setPlaceholder(
                'Please Select the Leave Channel.'
              )
							  .setMinValues(1)
              .setMaxValues(1)
              .setChannelTypes(ChannelType.GuildText)

            const firstRow = new ActionRowBuilder().addComponents(
              transactionsChannelSelect
            )

            interaction
              .followUp({
                embeds: [
                  new EmbedBuilder()
                    .setDescription(
                      '<:crvt:1196316646319595600> Select the Leave Channel from the Options Below'
                    )
                    .setColor('Green')
                ],
                components: [firstRow],
                fetchReply: true,
                ephemeral: true
              })
              .then(() => {
                const filter = (i) => (
                  i.user.id === interaction.user.id &&
										i.customId == 'leavechannelselect'
                )

                interaction.channel
                  .awaitMessageComponent({
                    filter,
                    componentType:
											ComponentType.ChannelSelect,
                    time: 60000
                  })
                  .then((int) => {
                    const leaveChannel = int.values[0]

                    if (!leaveChannel) {
                      client.db.set(
                        `${interaction.guild.id}.leave.channel`,
                        false
                      )
                      return int.reply({
                        embeds: [
                          new EmbedBuilder()
                            .setDescription(
                              `${client.emotes.tick} leave System disabled.`
                            )
                            .setColor('Green')
                        ],
                        ephemeral: true
                      })
                    }

                    client.db.set(
                      `${interaction.guild.id}.leave.channel`,
                      leaveChannel
                    )
                    int.reply({
                      embeds: [
                        new EmbedBuilder()
                          .setDescription(
                            `${client.emotes.tick} Leave channel set to <#${leaveChannel}>.`
                          )
                          .setColor('Green')
                      ],
                      ephemeral: true
                    })
                  })
                  .catch((err) => interaction.editReply({
                    ephemeral: true,
                    embeds: [
                      new EmbedBuilder()
                        .setColor('Red')
                        .setDescription(
                          `${client.emotes.cross} Looks like I didn't recive anything..`
                        )
                    ]
                  }))

                const embed = genEmbed()
                reply.edit({
                  components: [optionRowWlcm, optionRowLeave],
                  embeds: [embed]
                })
              })
          }
        },
        {
          name: 'config-leavemessage',
          callback (interactionCallback, button) {
            interaction
              .followUp({
                embeds: [
                  new EmbedBuilder()
                    .setColor('Blurple')
                    .setDescription(
                      `<:crvt:1196316646319595600> Send The Content for the leave message in the channel\n\n${bold(
                        'Variables'
                      )}\n- \`{{guild}}\` - Returns The Guild Name \n- \`{{user}}\` - Returns Member Mention \n- \`{{userid}}\` - Returns the Member's ID`
                    )
                ],
                ephemeral: true,
                fetchReply: true
              })
              .then(() => {
                const filter = (i) => i.author.id === interaction.user.id
                interaction.channel
                  .awaitMessages({
                    filter,
                    max: 1,
                    time: 30000,
                    errors: ['time']
                  })
                  .then((collected) => {
                    interaction.followUp({
                      embeds: [
                        new EmbedBuilder()
                          .setColor('Green')
                          .setDescription(
                            `${
                              client.emotes.tick
                            } New Leave Message Set\n\n${codeBlock(
                              collected.first()
                                .content
                            )}`
                          )
                      ],
                      ephemeral: true
                    })

                    client.db.set(
                      `${interaction.guild.id}.leave.message`,
                      collected.first().content
                    )

                    setTimeout(() => {
                      collected.first().delete()
                    }, 3000)
                  })
                  .catch((collected) => {
                    interaction.followUp({
                      embeds: [
                        new EmbedBuilder()
                          .setColor('Red')
                          .setDescription(
                            `${client.emotes.cross} Looks like I didn't recive anything..`
                          )
                      ],
                      ephemeral: true
                    })
                  })

                const embed = genEmbed()
                reply.edit({
                  components: [optionRowWlcm, optionRowLeave],
                  embeds: [embed]
                })
              })
          }
        },
        {
          name: 'config-leavecolor',
          callback (interactionCallback, button) {
            interaction
              .followUp({
                embeds: [
                  new EmbedBuilder()
                    .setColor('Blurple')
                    .setDescription(
                      '<:crvt:1196316646319595600> Send The Hex Code of the color you want in the Leave Embeds, in this channel'
                    )
                ],
                ephemeral: true,
                fetchReply: true
              })
              .then(() => {
                const filter = (i) => i.author.id === interaction.user.id
                interaction.channel
                  .awaitMessages({
                    filter,
                    max: 1,
                    time: 30000,
                    errors: ['time']
                  })
                  .then((collected) => {
                    const colorCode =											collected.first().content
                    const isValidHex =											/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(
                      colorCode
                    )

                    if (isValidHex) {
                      interaction.followUp({
                        embeds: [
                          new EmbedBuilder()
                            .setColor(
                              colorCode || 'Aqua'
                            )
                            .setDescription(
                              `<:crvt:1196316646319595600> **${colorCode}** will be the new leave embed color`
                            )
                        ],
                        ephemeral: true
                      })

                      client.db.set(
                        `${interaction.guild.id}.leave.color`,
                        colorCode
                      )

                      setTimeout(() => {
                        collected.first().delete()
                      }, 3000)
                    } else {
                      interaction.followUp({
                        embeds: [
                          new EmbedBuilder()
                            .setColor('Red')
                            .setDescription(
                              `${client.emotes.cross} The message sent is not a valid color code.`
                            )
                        ],
                        ephemeral: true
                      })
                    }
                  })
                  .catch((collected) => {
                    interaction.followUp({
                      embeds: [
                        new EmbedBuilder()
                          .setColor('Red')
                          .setDescription(
                            `${client.emotes.cross} Looks like I didn't recive anything..`
                          )
                      ],
                      ephemeral: true
                    })
                  })

                const embed = genEmbed()
                reply.edit({
                  components: [optionRowWlcm, optionRowLeave],
                  embeds: [embed]
                })
              })
          }
        },
        {
          name: 'config-leavefooter',
          callback (interactionCallback, button) {
            interaction
              .followUp({
                ephemeral: true,
                embeds: [
                  new EmbedBuilder()
                    .setColor('Blurple')
                    .setDescription(
                      `<:crvt:1196316646319595600> Send the Content for the Leave Footer here\n\n${bold(
                        'Variables'
                      )}\n- \`{{guild}}\` - Returns The Guild Name \n- \`{{user}}\` - Returns Member Mention \n- \`{{userid}}\` - Returns the Member's ID \n- \`{{count}}\` - Returns the Guild's Member Count`
                    )
                ],
                fetchReply: true
              })
              .then(() => {
                const filter = (i) => i.author.id === interaction.user.id
                interaction.channel
                  .awaitMessages({
                    filter,
                    max: 1,
                    time: 30000,
                    errors: ['time']
                  })
                  .then((collected) => {
                    interaction.followUp({
                      embeds: [
                        new EmbedBuilder()
                          .setColor('Green')
                          .setDescription(
                            `${
                              client.emotes.tick
                            } New Footer Set\n\n${codeBlock(
                              collected.first()
                                .content
                            )}`
                          )
                      ],
                      ephemeral: true
                    })

                    client.db.set(
                      `${interaction.guild.id}.leave.footer`,
                      collected.first().content
                    )

                    setTimeout(() => {
                      collected.first().delete()
                    }, 3000)
                  })
                  .catch((collected) => {
                    interaction.followUp({
                      embeds: [
                        new EmbedBuilder()
                          .setColor('Red')
                          .setDescription(
                            `${client.emotes.cross} Looks like I didn't recive anything..`
                          )
                      ],
                      ephemeral: true
                    })
                  })

                const embed = genEmbed()
                reply.edit({
                  components: [optionRowWlcm, optionRowLeave],
                  embeds: [embed]
                })
              })
          }
        }
      ])
      .build()
  }
}
