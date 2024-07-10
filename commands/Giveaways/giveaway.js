const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  SlashCommandBuilder,
  ChannelType,
  PermissionFlagsBits,
  time,
  quote,
  hyperlink
} = require('discord.js')
const ms = require('enhanced-ms')

module.exports = {
  data: new SlashCommandBuilder()
    .setName('giveaway')
    .setDescription('🎉 Host and Manage Giveaway')
    .setDMPermission(false)
    .addSubcommand((subcommand) =>
      subcommand
        .setName('start')
        .setDescription('🎉 Start a giveaway')
        .addStringOption((x) =>
          x
            .setName('duration')
            .setDescription(
              '⌚ Time duration of the giveaway. (Ex: 1min, 1d, etc)'
            )
            .setRequired(true)
        )
        .addStringOption((x) =>
          x
            .setName('prize')
            .setDescription('🎁 The giveaway reward')
            .setRequired(true)
        )
        .addIntegerOption((x) =>
          x
            .setName('winners')
            .setDescription('👥 Number of winners in the giveaway')
            .setRequired(false)
        )
        .addChannelOption((x) =>
          x
            .setName('channel')
            .setDescription(
              '📍 The channel the giveaway should be hosted at, (Defaults to Current channel)'
            )
            .addChannelTypes(
              ChannelType.GuildText,
              ChannelType.GuildAnnouncement
            )
            .setRequired(false)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('end')
        .setDescription('🎉 End a giveaway')
        .addStringOption((x) =>
          x
            .setName('message_id')
            .setDescription(
              '🆔 The message id of the giveaway you plan to end'
            )
            .setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('reroll')
        .setDescription('🎲 Reroll a giveaway')
        .addStringOption((x) =>
          x
            .setName('message_id')
            .setDescription(
              '🆔 The message id of the giveaway you plan to reroll'
            )
            .setRequired(true)
        )
        .addIntegerOption((x) =>
          x
            .setName('winners')
            .setDescription(
              '👥 Number of winners to reroll, defaults to base winners set when hosting the giveaway'
            )
            .setRequired(false)
        )
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
  global: true,
  run: async (client, interaction) => {
    switch (interaction.options.getSubcommand()) {
      case 'start':
        const giveawayChannel = interaction.options.getChannel(
          'channel'
        )
          ? interaction.options.getChannel('channel')
          : interaction.channel
        const giveawayDuration =
					interaction.options.getString('duration')
        const giveawayWinnerCount = interaction.options.getInteger(
          'winners'
        )
          ? interaction.options.getInteger('winners')
          : 1
        const giveawayPrize = interaction.options.getString('prize')

        if (!mstime(giveawayDuration)) {
          return interaction.reply({
            embeds: [
              new EmbedBuilder()
                .setDescription(
									`${client.emotes.clock} Invalid Time Format!!`
                )
                .setColor('Red')
            ],
            ephemeral: true
          })
        }

        const embed = new EmbedBuilder()
          .setAuthor({
            name: giveawayPrize
          })
          .setDescription(
						`${quote(`${giveawayWinnerCount} Winner(s)`)}`
          )
          .setFields(
            {
              name: 'Ends',
              value: `${time(
								Math.round(
									(Date.now() + mstime(giveawayDuration)) /
										1000
								),
								'R'
							)}`,
              inline: true
            },
            {
              name: 'Hosted by',
              value: `${interaction.member}`,
              inline: true
            }
          )
          .setThumbnail(interaction.guild.iconURL())
          .setColor('Blurple')
          .setTimestamp()
        const multi = await client.db.get(
					`${interaction.guild.id}.giveaway.multi`
        )

        if (multi && multi.length > 0) {
          const mm = multi
            .map((x) => `> <@&${x.role}> - **x${x.multi}**`)
            .join('\n')

          embed.setDescription(
						`${quote(
							`${giveawayWinnerCount} Winner(s)`
						)}\n\n**Multipliers**\n${mm}`
          )
        }
        const row = new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId('giveaway')
            .setEmoji('🎉')
            .setStyle(ButtonStyle.Primary)
        )
        try {
          giveawayChannel
            .send({
              content: `**${client.emotes.tada} Giveaway Started!**`,
              embeds: [embed],
              components: [row]
            })
            .then((x) => {
              client.db.push('giveaways', {
                messageId: x.id,
                channelId: x.channelId,
                guildId: x.guildId,
                prize: giveawayPrize,
                started: Date.now(),
                winCount: giveawayWinnerCount,
                endTime: Date.now() + mstime(giveawayDuration),
                hostedBy: interaction.user.id,
                ended: false,
                url: x.url
              })
              client.db.set(
								`${x.guildId}.giveaway.${x.id}.entry`,
								[]
              )
              client.db.set(
								`${x.guildId}.giveaway.${x.id}.entered`,
								0
              )
              client.db.set(
								`${x.guildId}.giveaway.${x.id}.winners`,
								[]
              )
              interaction.reply({
                embeds: [
                  new EmbedBuilder()
                    .setColor('Green')
                    .setTimestamp()
                    .setDescription(
											`${
												client.emotes.tick
											} Giveaway Posted for ${hyperlink(
												giveawayPrize,
												x.url
											)}`
                    )
                ],
                ephemeral: true
              })
            })
        } catch {
          interaction.reply({
            embeds: [
              new EmbedBuilder()
                .setColor('Red')
                .setDescription(
									`${client.emotes.cross} Error when posting the giveaway`
                )
            ],
            ephemeral: true
          })
        }
        break
      case 'reroll':
        const gwId = interaction.options.getString('message_id')

        data = await client.db
          .get('giveaways')
          .filter((x) => x.messageId == gwId)
        if (!data || !data[0]) {
          return interaction.reply({
            embeds: [
              new EmbedBuilder()
                .setColor('Red')
                .setDescription(
									`${client.emotes.cross} Couldn't find the giveaway`
                )
            ],
            ephemeral: true
          })
        }

        if (!data[0].ended) {
          return interaction.reply({
            embeds: [
              new EmbedBuilder()
                .setColor('Yellow')
                .setDescription(
									`${client.emotes.warning} ${hyperlink(
										'Giveway',
										data[0].url
									)} has yet not been ended..`
                )
            ],
            ephemeral: true
          })
        }

        const gwWinners = interaction.options.getInteger('winners')
          ? interaction.options.getInteger('winners')
          : data[0].winCount

        const guild = client.guilds.cache.get(data[0].guildId)
        if (!guild) {
          return interaction.reply({
            embeds: [
              new EmbedBuilder()
                .setColor('Red')
                .setDescription(
									`${client.emotes.warning} Im no longer in the guild ${data[0].guild}`
                )
            ],
            ephemeral: true
          })
        }

        const channel = await guild.channels.fetch(data[0].channelId)
        if (!channel) {
          return interaction.reply({
            embeds: [
              new EmbedBuilder()
                .setColor('Red')
                .setDescription(
									`${client.emotes.warning} I couldn't locate the channel ${data[0].channelId}`
                )
            ],
            ephemeral: true
          })
        }

        const msg = await channel.messages.fetch(data[0].messageId)
        if (!msg) {
          return interaction.reply({
            embeds: [
              new EmbedBuilder()
                .setColor('Red')
                .setDescription(
									`${client.emotes.warning} Couldn't find the message ${data[0].messageId}`
                )
            ],
            ephemeral: true
          })
        }
        const eembed = EmbedBuilder.from(msg.embeds[0])
        const entry = client.db.get(
					`${data[0].guildId}.giveaway.${data[0].messageId}.entry`
        )

        if (entry.length <= 0) {
          msg.reply(
						`${client.emotes.cross} I can't reroll a ${hyperlink(
							'giveaway',
							data[0].url
						)} with no entries`
          )
        } else {
          const shuffled = entry.sort(() => 0.5 - Math.random())

          const selected = shuffled.slice(0, gwWinners)

          client.db.set(
						`${data[0].guildId}.giveaway.${data[0].messageId}.winners`,
						selected
          )

          const winners = selected.map((x) => `<@${x}>`)

          eembed.setDescription(`**Rerolled Winners**\n${winners}`)
          msg.reply({
            content: `${client.emotes.exclm} ${winners.join(
							', '
						)}!`,
            embeds: [
              new EmbedBuilder()
                .setColor('Aqua')
                .setAuthor({
                  name: 'Congratulations!'
                })
                .setDescription(
									`${
										winners.length > 1 ? 'Yall' : 'You'
									} have won the giveaway for ${hyperlink(
										data[0].prize,
										data[0].url
									)}`
                )
                .setFooter({
                  text: `${interaction.member.username} rerolled the giveaway`,
                  iconURL: `${interaction.member.displayAvatarURL()}`
                })
            ]
          })
          msg.edit({
            embeds: [eembed]
          })
        }

        interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setColor('DarkButNotBlack')
              .setDescription(
								`${client.emotes.tick} Rerolling ${hyperlink(
									'Giveaway',
									data[0].url
								)}...`
              )
              .setTimestamp()
          ],
          ephemeral: true
        })

        break
      case 'end':
        const giveawayId = interaction.options.getString('message_id')

        data = await client.db
          .get('giveaways')
          .filter((x) => x.messageId == giveawayId)
        if (!data || !data[0]) {
          return interaction.reply({
            embeds: [
              new EmbedBuilder()
                .setColor('Red')
                .setDescription(
									`${client.emotes.cross} Couldn't find the giveaway`
                )
            ],
            ephemeral: true
          })
        }

        client.db.pull(
          'giveaways',
          (element) => {
            return element.messageId == giveawayId
          },
          true
        )

        data[0].endTime = Date.now()
        data[0].forced = true

        client.db.push('giveaways', data[0])

        interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setColor('DarkButNotBlack')
              .setDescription(
								`${client.emotes.tick} Ending ${hyperlink(
									'Giveaway',
									data[0].url
								)}...`
              )
          ],
          ephemeral: true
        })

        break

      default:
        break
    }
  }
}

function mstime (d) {
  try {
    return ms(d)
  } catch {
    return undefined
  }
}
