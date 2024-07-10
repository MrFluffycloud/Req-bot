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
	run: async (client, interaction) => {  if (interaction.options.getSubcommand() == 'message') {
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
