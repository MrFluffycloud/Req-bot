const {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionsBitField,
  ChannelType
} = require('discord.js')
const ms = require('ms')

module.exports = {
  data: new SlashCommandBuilder()
    .setName('config')
    .setDescription('🔧 Configure the bot'),
  /*
		.addSubcommand((subcommand) =>
			subcommand
				.setName('memberlog_channel')
				.setDescription('📍 Set the member log for the leave channel and welcome channel.')
				.addChannelOption((option) =>
					option
						.setName('channel')
						.setDescription(
							'Set the member log channel, if unset member log module will be disabled'
						)
						.setRequired(false)
						.addChannelTypes(ChannelType.GuildText)
				)
		)
		.addSubcommand((subcommand) =>
			subcommand
				.setName('log_channel')
				.setDescription('📍 Select the moderation log channel')
				.addChannelOption((option) =>
					option
						.setName('channel')
						.setDescription(
							'Set the log channel, if not provided, moderation module might not function'
						)
						.setRequired(true)
						.addChannelTypes(ChannelType.GuildText)
				)
		) */ global: true,
  run: async (client, interaction) => {
    /* if (
			interaction.options.getSubcommand() === 'memberlog_channel'
		) {
			const MemLogChannel = interaction.options.getChannel('channel');

			if (!MemLogChannel) {
				client.db.set(
					`${interaction.guild.id}.memberlog.channel`,
					false
				);
				return interaction.reply({
					embeds: [
						new EmbedBuilder()
							.setDescription(
								`${client.emotes.tick} Member Logging System disabled.`
							)
							.setColor('Green'),
					],
					ephemeral: true,
				});
			}

			client.db.set(
				`${interaction.guild.id}.memberlog.channel`,
				MemLogChannel.id
			);
			interaction.reply({
				embeds: [
					new EmbedBuilder()
						.setDescription(
							`${client.emotes.tick} Member Log channel set to ${MemLogChannel}.`
						)
						.setColor('Green'),
				],
				ephemeral: true,
			});
		} else if (interaction.options.getSubcommand() === 'log_channel') {
			const LogChannel = interaction.options.getChannel('channel');

			client.db.set(
				`${interaction.guild.id}.config.logChannel`,
				LogChannel.id
			);
			interaction.reply({
				embeds: [
					new EmbedBuilder()
						.setDescription(
							`${client.emotes.tick} Log channel set to ${LogChannel}.`
						)
						.setColor('Green'),
				],
				ephemeral: true,
			});
		} */
  }
}
