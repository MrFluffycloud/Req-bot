const {
	EmbedBuilder,
	ActionRowBuilder,
	ButtonBuilder,
	ComponentType,
	ChannelType,
	ChannelSelectMenuBuilder,
	codeBlock,
	bold,
} = require('discord.js');
const { PagesBuilder } = require('discord.js-pages');

module.exports = {
	async execute(interaction, client) {
		const reply = await interaction.deferUpdate();

		const guildId = interaction.guild.id;

		const memlog =
			client.db.get(`${guildId}.memberlog.channel`) || undefined;
		const log = client.db.get(`${guildId}.config.logChannel`) || undefined;

		const genEmbed = () => {
			const memlog =
				client.db.get(`${guildId}.memberlog.channel`) || undefined;
			const log =
				client.db.get(`${guildId}.config.logChannel`) || undefined;

			const memlogChannel = memlog ? `<#${memlog}>` : 'Not Set';

			const logChannel = log ? `<#${log}>` : 'Not Set';

			return new EmbedBuilder()
				.setColor('Blurple')
				.setDescription('`📥` Logs Settings')
				.setThumbnail(client.user.displayAvatarURL())
				.addFields(
					{
						name: `Moderation/System Logs \`[${
							log ? 'Enabled' : 'Disabled'
						}]\``,
						value: '\u200B',
						inline: false,
					},
					{
						name: '<:crvt:1196316646319595600> Channel',
						value: logChannel,
						inline: true,
					}
				)
				.addFields(
					{
						name: `Member Logs \`[${
							memlog ? 'Enabled' : 'Disabled'
						}]\``,
						value: '\u200B',
						inline: false,
					},
					{
						name: '<:crvt:1196316646319595600> Channel',
						value: memlogChannel,
						inline: true,
					}
				)
				.setTimestamp()
				.setFooter({
					text: interaction.guild.name,
					iconURL: interaction.guild.iconURL(),
				});
		};

		const genRow = () => {
			const memlog =
				client.db.get(`${guildId}.memberlog.channel`) || undefined;
			const log =
				client.db.get(`${guildId}.config.logChannel`) || undefined;
			return new ActionRowBuilder().addComponents(
				new ButtonBuilder()
					.setCustomId('config-logchannel')
					.setLabel('Mod Log Channel')
					.setStyle(log ? 'Success' : 'Danger'),
				new ButtonBuilder()
					.setCustomId('config-memlogchannel')
					.setLabel('Member Log Channel')
					.setStyle(memlog ? 'Success' : 'Danger')
			);
		};

		const optionRow = genRow();
		const embed = genEmbed();
		new PagesBuilder(interaction)
			.setPages([embed])
			.setComponents([optionRow])
			.setDefaultButtons([])
			.setTriggers([
				{
					name: 'config-logchannel',
					callback(interactionCallback, button) {
						const transactionsChannelSelect =
							new ChannelSelectMenuBuilder()
								.setCustomId('logchannelselect')
								.setPlaceholder(
									'Please Select the Log Channel.'
								)
								.setMinValues(1)
								.setMaxValues(1)
								.setChannelTypes(ChannelType.GuildText);

						const firstRow = new ActionRowBuilder().addComponents(
							transactionsChannelSelect
						);

						interaction
							.followUp({
								embeds: [
									new EmbedBuilder()
										.setDescription(
											'<:crvt:1196316646319595600> Select the Moderation/System Log Channel from the Options Below'
										)
										.setColor('Green'),
								],
								components: [firstRow],
								fetchReply: true,
								ephemeral: true,
							})
							.then(() => {
								const filter = (i) =>
									i.user.id === interaction.user.id &&
									i.customId == 'logchannelselect';

								interaction.channel
									.awaitMessageComponent({
										filter,
										componentType:
											ComponentType.ChannelSelect,
										time: 60000,
									})
									.then((int) => {
										const logChnl = int.values[0];

										if (!logChnl) {
											client.db.set(
												`${interaction.guild.id}.config.logChannel`,
												false
											);
											return int.reply({
												embeds: [
													new EmbedBuilder()
														.setDescription(
															`${client.emotes.tick} Moderation Loggined Unset.`
														)
														.setColor('Green'),
												],
												ephemeral: true,
											});
										}

										client.db.set(
											`${interaction.guild.id}.config.logChannel`,
											logChnl
										);
										int.reply({
											embeds: [
												new EmbedBuilder()
													.setDescription(
														`${client.emotes.tick} Moderation Log channel set to <#${logChnl}>.`
													)
													.setColor('Green'),
											],
											ephemeral: true,
										});
									})
									.catch((err) =>
										interaction.editReply({
											ephemeral: true,
											embeds: [
												new EmbedBuilder()
													.setColor('Red')
													.setDescription(
														`${client.emotes.cross} Looks like I didn't recive anything..`
													),
											],
										})
									);
								const embed = genEmbed();
								const optionRow = genRow();
								reply.edit({
									components: [optionRow],
									embeds: [embed],
								});
							});
					},
				},
				{
					name: 'config-memlogchannel',
					callback(interactionCallback, button) {
						const transactionsChannelSelect =
							new ChannelSelectMenuBuilder()
								.setCustomId('memlogchannelselect')
								.setPlaceholder(
									'Please Select the Member Log Channel.'
								)
								.setMinValues(1)
								.setMaxValues(1)
								.setChannelTypes(ChannelType.GuildText);

						const firstRow = new ActionRowBuilder().addComponents(
							transactionsChannelSelect
						);

						interaction
							.followUp({
								embeds: [
									new EmbedBuilder()
										.setDescription(
											'<:crvt:1196316646319595600> Select the Member Log Channel from the Options Below'
										)
										.setColor('Green'),
								],
								components: [firstRow],
								fetchReply: true,
								ephemeral: true,
							})
							.then(() => {
								const filter = (i) =>
									i.user.id === interaction.user.id &&
									i.customId == 'memlogchannelselect';

								interaction.channel
									.awaitMessageComponent({
										filter,
										componentType:
											ComponentType.ChannelSelect,
										time: 60000,
									})
									.then((int) => {
										const memlogChnl = int.values[0];

										if (!memlogChnl) {
											client.db.set(
												`${interaction.guild.id}.memberlog.channel`,
												false
											);
											return int.reply({
												embeds: [
													new EmbedBuilder()
														.setDescription(
															`${client.emotes.tick} Member Logs Unset.`
														)
														.setColor('Green'),
												],
												ephemeral: true,
											});
										}

										client.db.set(
											`${interaction.guild.id}.memberlog.channel`,
											memlogChnl
										);
										int.reply({
											embeds: [
												new EmbedBuilder()
													.setDescription(
														`${client.emotes.tick} Member Logs channel set to <#${memlogChnl}>.`
													)
													.setColor('Green'),
											],
											ephemeral: true,
										});
									})
									.catch((err) =>
										interaction.editReply({
											ephemeral: true,
											embeds: [
												new EmbedBuilder()
													.setColor('Red')
													.setDescription(
														`${client.emotes.cross} Looks like I didn't recive anything..`
													),
											],
										})
									);

								const embed = genEmbed();
								const optionRow = genRow();

								reply.edit({
									components: [optionRow],
									embeds: [embed],
								});
							});
					},
				},
			])
			.build();
	},
};
