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

		const genEmbed = () => {
			const log = client.db.get(`${guildId}.admod.channel`) || undefined;

			const logChannel = log ? `<#${log}>` : 'Not Set';
			const modMessage =
				client.db.get(`${guildId}.admod.message`) || 'Not Set';

			return new EmbedBuilder()
				.setColor('Blurple')
				.setDescription('`🛑` Ad Mod Settings')
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
					},
					{
						name: '<:crvt:1196316646319595600> Mod Message',
						value: `\`${modMessage}\``,
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
			const log = client.db.get(`${guildId}.admod.channel`) || undefined;
			const modMessage =
				client.db.get(`${guildId}.admod.message`) || undefined;
			return new ActionRowBuilder().addComponents(
				new ButtonBuilder()
					.setCustomId('config-logchannel')
					.setLabel('AD Mod Log Channel')
					.setStyle(log ? 'Success' : 'Danger'),
				new ButtonBuilder()
					.setCustomId('config-modmessage')
					.setLabel('Set Mod Message')
					.setStyle(modMessage ? 'Success' : 'Danger')
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
											'<:crvt:1196316646319595600> Select the AD Moderation Log Channel from the Options Below'
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
												`${interaction.guild.id}.admod.channel`,
												false
											);
											return int.reply({
												embeds: [
													new EmbedBuilder()
														.setDescription(
															`${client.emotes.tick} AD Moderation Logging Channel Unset.`
														)
														.setColor('Green'),
												],
												ephemeral: true,
											});
										}

										client.db.set(
											`${interaction.guild.id}.admod.channel`,
											logChnl
										);
										int.reply({
											embeds: [
												new EmbedBuilder()
													.setDescription(
														`${client.emotes.tick} AD Moderation Log channel set to <#${logChnl}>.`
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
					name: 'config-modmessage',
					callback(interactionCallback, button) {
						interaction
							.followUp({
								embeds: [
									new EmbedBuilder()
										.setDescription(
											'Please enter the new moderation message:'
										)
										.setColor('Green'),
								],
								fetchReply: true,
								ephemeral: true,
							})
							.then(() => {
								const filter = (msg) =>
									msg.author.id === interaction.user.id;
								const collector =
									interaction.channel.createMessageCollector({
										filter,
										time: 60000,
										max: 1,
									});

								collector.on('collect', (msg) => {
									const newMessage = msg.content;

									client.db.set(
										`${interaction.guild.id}.admod.message`,
										newMessage
									);
									msg.reply({
										embeds: [
											new EmbedBuilder()
												.setDescription(
													`${client.emotes.tick} AD Moderation message set to: "${newMessage}"`
												)
												.setColor('Green'),
										],
										ephemeral: true,
									});
								});

								collector.on('end', (collected, reason) => {
									if (reason === 'time') {
										interaction.followUp({
											embeds: [
												new EmbedBuilder()
													.setDescription(
														`${client.emotes.cross} You didn't enter any message.`
													)
													.setColor('Red'),
											],
											ephemeral: true,
										});
									}
									const embed = genEmbed();
									const optionRow = genRow();
									reply.edit({
										components: [optionRow],
										embeds: [embed],
									});
								});
							});
					},
				},
			])
			.build();
	},
};
