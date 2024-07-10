const {
	EmbedBuilder,
	SlashCommandBuilder,
	PermissionFlagsBits,
	time,
	ChannelType,
} = require('discord.js');
const ms = require('ms');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('admod')
		.setDescription('Ad Moderation')

		.addSubcommand((subcommand) =>
			subcommand
				.setName('warn')
				.setDescription('Warn for advert')
				.addUserOption((option) =>
					option
						.setName('member')
						.setDescription('The member you would like to warn')
						.setRequired(true)
				)
				.addChannelOption((option) =>
					option
						.setName('channel')
						.setDescription('The channel for adwarn notificaiton')
						.setRequired(true)
						.addChannelTypes(ChannelType.GuildText)
				)
				.addStringOption((option) =>
					option
						.setName('reason')
						.setDescription('The reason to warn the user')
						.setRequired(true)
						.setAutocomplete(true)
				)
		)
		.addSubcommand((subcommand) =>
			subcommand
				.setName('unwarn')
				.setDescription('Remove a users warn')
				.addUserOption((option) =>
					option
						.setName('member')
						.setDescription('The member you would like to warn')
						.setRequired(true)
				)
				.addIntegerOption((option) =>
					option
						.setName('warns')
						.setDescription('The amout of wanrs to remove')
						.setRequired(false)
				)
		)
		.addSubcommand((subcommand) =>
			subcommand
				.setName('reasons')
				.setDescription('Create Reason Presets')
				.addStringOption((option) =>
					option
						.setName('reason')
						.setDescription('The reasons')
						.setRequired(true)
				)
				.addStringOption((option) =>
					option
						.setName('correction')
						.setDescription('Correction')
						.setRequired(true)
				)
		)
		.addSubcommand((subcommand) =>
			subcommand
				.setName('message')
				.setDescription('Default Message to share.')
				.addStringOption((option) =>
					option
						.setName('message')
						.setDescription('The message')
						.setRequired(true)
				)
		)
		.setDMPermission(false)
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
	global: true,
	async autocomplete(interaction, client) {
		const focusedOption = interaction.options.getFocused(true);
		let choices;

		if (focusedOption.name === 'reason') {
			choices = await client.db.get(
				`${interaction.guild.id}.admod.reasons`
			);

			if (!choices || choices.length <= 0)
				choices = [
					{
						reason: 'No Reason',
						value: 'no_reason',
						correction: 'Use The Correct Channel',
					},
				];
		}
		const filtered = choices.filter((choice) =>
			choice.reason.startsWith(focusedOption.value)
		);

		await interaction.respond(
			filtered.map((choice) => {
				return {
					name: choice.reason,
					value: choice.value.replaceAll(' ', '_').toLowerCase(),
				};
			})
		);
	},
	run: async (client, interaction) => {
		if (interaction.options.getSubcommand() == 'warn') {
			await interaction.deferReply();
			const member = interaction.options.getMember('member');
			const channel = interaction.options.getChannel('channel');

			if (!member) {
				return interaction.editReply(
					"Couldn't find any such member in the guild!"
				);
			}

			const reasod = interaction.options.getString('reason')
				? interaction.options.getString('reason')
				: 'Not provided';
			const reasons =
				(await client.db.get(
					`${interaction.guild.id}.admod.reasons`
				)) || [];
			const reason = reasons.filter((x) => x.value == reasod)[0] || {
				reason: reasod,
				correction: 'Not Set',
			};

			client.db.add(
				`${interaction.guild.id}.admod.warns.${interaction.user.id}`,
				1
			);

			const count = client.db.get(
				`${interaction.guild.id}.admod.warns.${interaction.user.id}`
			);

			const message = client.db.get(
				`${interaction.guild.id}.admod.message`
			);
			const embed = new EmbedBuilder()
				.setAuthor({
					name: member.user.username,
					iconURL: member.displayAvatarURL(),
				})
				.setTitle('Advertisement Deleted')
				.addFields(
					{
						name: '`👤` User',
						value: `${member} \`(${member.id})\``,
						inline: false,
					},
					{
						name: '`⚒️` Moderator',
						value: `${interaction.member} \`(${interaction.user.id})\``,
						inline: false,
					},
					{
						name: '`⚠️` Warnings',
						value: `#${count}`,
						inline: false,
					},
					{
						name: '`#️⃣` Channel',
						value: `${channel}`,
						inline: false,
					},
					{
						name: '`🔨` Reason',
						value: reason.reason,
						inline: false,
					},
					{
						name: '`✅` Correction',
						value: reason.correction,
						inline: false,
					},
					{
						name: '\u200B',
						value: `> ${
							message ||
							'Do use the appropriate channel for advertising'
						}`,
						inline: false,
					}
				)
				.setTimestamp()
				.setColor('Red')
				.setFooter({
					text: `${interaction.guild.name}`,
					iconURL: interaction.guild.iconURL(),
				});

			const dmEmbed = new EmbedBuilder()
				.setAuthor({
					name: interaction.guild.name,
					iconURL: interaction.guild.iconURL(),
				})
				.addFields(
					{
						name: '`#️⃣` Channel',
						value: `${channel}`,
						inline: true,
					},
					{
						name: '`⚠️` Warnings',
						value: `#${count}`,
						inline: true,
					},
					{ name: '`🔨` Reason', value: reason.reason, inline: true },
					{
						name: '`✅` Correction',
						value: reason.correction,
						inline: true,
					}
				)
				.setTimestamp()
				.setColor('Red')
				.setTitle('Your add has been deleted')
				.setFooter({
					text: `From: ${interaction.guild.name}`,
					iconURL: interaction.guild.iconURL(),
				});

			try {
				member.send({ embeds: [dmEmbed] });
			} catch {
				console.error(`Couldn't DM the user`);
			}
			const logChannelId = client.db.get(
				`${interaction.guild.id}.config.logChannel`
			);
            
			if (!logChannelId)
				return interaction.editReply({
					content:
						'Log channel not found! Contact the admins to set it up!',
					ephemeral: true,
				});

			const logChannel = await interaction.guild.channels.fetch(
				logChannelId
			);

			if (!logChannel) {
				return await interaction.editReply({
					content:
						'Log channel not found! Contact the admins to set it up!',
				});
			}

			const warnChannelId = client.db.get(
				`${interaction.guild.id}.admod.channel`
			);

			if (!warnChannelId)
				return interaction.editReply({
					content:
						'Ad Warn channel not found! Contact the admins to set it up!',
					ephemeral: true,
				});

			const warnChannel = await interaction.guild.channels.fetch(
				warnChannelId
			);

			if (!warnChannel) {
				return await interaction.editReply({
					content:
						'War Channel not found! Contact the admins to set it up!',
				});
			}

			logChannel.send({ embeds: [embed] });
			warnChannel.send({ content: `${member}`, embeds: [embed] });
			interaction.editReply({ embeds: [embed] });
		} else if (interaction.options.getSubcommand() == 'unwarn') {
			await interaction.deferReply();
			const member = interaction.options.getMember('member');
			let warns = interaction.options.getInteger('warns');

			if (!member) {
				return interaction.editReply(
					"Couldn't find any such member in the guild!"
				);
			}
			const count = client.db.get(
				`${interaction.guild.id}.admod.warns.${interaction.user.id}`
			);

			if (!warns) warns = 1;
			if (warns > count) warns = count;

			client.db.substr(
				`${interaction.guild.id}.admod.warns.${interaction.user.id}`,
				warns
			);

			const embed = new EmbedBuilder()
				.setAuthor({
					name: member.user.username,
					iconURL: member.displayAvatarURL(),
				})
				.setTitle('Advertisement Warn Decreased')
				.addFields(
					{
						name: '`👤` User',
						value: `${member} \`(${member.id})\``,
						inline: false,
					},
					{
						name: '`⚒️` Moderator',
						value: `${interaction.member} \`(${interaction.user.id})\``,
						inline: false,
					},
					{
						name: '`⚠️` Warnings',
						value: `#${count - warns}`,
						inline: false,
					}
				)
				.setTimestamp()
				.setColor('Red')
				.setFooter({
					text: `${interaction.guild.name}`,
					iconURL: interaction.guild.iconURL(),
				});

			interaction.editReply({ embeds: [embed] });
		} else if (interaction.options.getSubcommand() == 'reasons') {
			const reason = interaction.options.getString('reason');
			const correction = interaction.options.getString('correction');

			client.db.push(`${interaction.guild.id}.admod.reasons`, {
				correction: correction,
				reason: reason,
				value: reason.replaceAll(' ', '_').toLowerCase(),
			});
			interaction.reply({
				embeds: [
					new EmbedBuilder()
						.setDescription(
							`${client.emotes.tick} Added a Ad Mod Reason\n\nReason: ${reason}\nCorrection: ${correction}.`
						)
						.setColor('Green'),
				],
				ephemeral: true,
			});
		} else if (interaction.options.getSubcommand() == 'message') {
			const message = interaction.options.getString('message');

			client.db.push(`${interaction.guild.id}.admod.message`, message);
			interaction.reply({
				embeds: [
					new EmbedBuilder()
						.setDescription(
							`${client.emotes.tick} Added a Ad Mod Message set to\n\n> ${message}`
						)
						.setColor('Green'),
				],
				ephemeral: true,
			});
		}
	},
};
