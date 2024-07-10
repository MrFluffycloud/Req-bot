const {
	EmbedBuilder,
	SlashCommandBuilder,
	PermissionFlagsBits,
} = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('blacklist')
		.setDescription('❌ Giveaway Blackslist Config')
		.setDMPermission(false)
		.addSubcommand((subcommand) =>
			subcommand
				.setName('add')
				.setDescription('➕ Blacklist a user from giveaways')
				.addUserOption((x) =>
					x
						.setName('user')
						.setDescription(
							'👤 The user which you want to blacklist from giveaways'
						)
						.setRequired(true)
				)
		)
		.addSubcommand((subcommand) =>
			subcommand
				.setName('remove')
				.setDescription('➖ Remove a user from the Blacklist')
				.addUserOption((x) =>
					x
						.setName('user')
						.setDescription(
							'👤 The user which you want to remove blacklist from giveaways'
						)
						.setRequired(true)
				)
		)
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
	global: true,
	run: async (client, interaction) => {
		switch (interaction.options.getSubcommand()) {
			case 'add':
				const user = interaction.options.getUser('user');

				client.db.pull(
					`${interaction.guild.id}.giveaway.blocklist`,
					(element) => element == user.id,
					true
				);
				client.db.push(
					`${interaction.guild.id}.giveaway.blocklist`,
					user.id
				);

				interaction.reply({
					embeds: [
						new EmbedBuilder()
							.setDescription(
								`${client.emotes.tick} Blacklisted of ${user}`
							)
							.setColor('Green'),
					],
					ephemeral: true,
				});

				break;
			case 'remove':
				const ruser = interaction.options.getUser('user');
				client.db.pull(
					`${interaction.guild.id}.giveaway.blocklist`,
					(element) => element == ruser.id,
					true
				);

				interaction.reply({
					embeds: [
						new EmbedBuilder()
							.setDescription(
								`${client.emotes.tick} Removed blacklist of ${ruser}`
							)
							.setColor('Green'),
					],
					ephemeral: true,
				});
				break;

			default:
				break;
		}
	},
};
