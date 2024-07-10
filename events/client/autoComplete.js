const { Events, InteractionType } = require('discord.js')

module.exports = {
  name: Events.InteractionCreate,
  once: false,
  async execute (interaction, client) {
    if (
      interaction.type === InteractionType.ApplicationCommandAutocomplete
    ) {
      const command = interaction.client.slashcommands.get(
        interaction.commandName
      )

      if (!command) {
        console.error(
          `No command matching ${interaction.commandName} was found.`
        )
        return
      }

      try {
        await command.autocomplete(interaction, client)
      } catch (error) {
        console.error(error)
      }
    }
  }
}
