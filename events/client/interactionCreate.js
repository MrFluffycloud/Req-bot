const ms = require('enhanced-ms')
const {
  Events,
  Collection,
  InteractionType,
  EmbedBuilder
} = require('discord.js')

const cooldowns = new Collection()

module.exports = {
  name: Events.InteractionCreate,
  once: false,
  async execute (interaction, client) {
    if (interaction.type != InteractionType.ApplicationCommand) return

    if (!interaction.guild) {
      return interaction.reply('I only work in Guilds.')
    }

    const command = client.slashcommands.get(interaction.commandName)

    if (!command) return

    if (!cooldowns.has(command.name)) {
      cooldowns.set(command.name, new Collection())
    }

    const now = Date.now()
    const timestamps = cooldowns.get(command.name)
    const cooldownAmount = (command.cooldown || 3) * 1000

    if (timestamps.has(interaction.user.id)) {
      const expirationTime =				timestamps.get(interaction.user.id) + cooldownAmount
      if (now < expirationTime) {
        const timeLeft = expirationTime - now
        return interaction.reply({
          embeds: [
            new EmbedBuilder().setDescription(
              `Please wait a few more second(s) before reusing the \`${
                command.data.name
              }\` command.`
            )
          ],
          ephemeral: true
        })
      }
    }

    if (command.ownerOnly) {
      if (!client.config.ownerIds.includes(interaction.user.id)) {
        return interaction.reply({
          embeds: [
            new EmbedBuilder().setDescription(
              'This command is to be only used by Bot Owners'
            )
          ],
          ephemeral: true
        })
      }
    }

    timestamps.set(interaction.user.id, now)
    setTimeout(
      () => timestamps.delete(interaction.user.id),
      cooldownAmount
    )

    try {
      await command.run(client, interaction)
    } catch (err) {
      console.error(err)

      await interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor('Red')
            .setDescription(
              `There was an error while executing this </${interaction.commandName}:${interaction.commandId}>!`
            )
        ],
        ephemeral: true
      })
    }
  }
}
