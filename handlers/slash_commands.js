const { Routes, REST } = require('discord.js')
const fs = require('fs')
const AsciiTable = require('ascii-table')

const table = new AsciiTable('Slash Commands Loaded')
table.setHeading('Name', 'Type', 'File')

module.exports = async (client) => {
  const GlobalCommands = []
  const GuildCommands = []

  fs.readdirSync('./commands/').forEach(async (dir) => {
    const commandFiles = fs
      .readdirSync(`./commands/${dir}/`)
      .filter((file) => file.endsWith('.js'))

    commandFiles.forEach(async (file) => {
      const command = require(`../commands/${dir}/${file}`)
      if (command.global) {
        GlobalCommands.push(command.data.toJSON())
        table.addRow(command.data.name, 'Guild', file)
      } else if (!command.global && client.config.guildId) {
        GuildCommands.push(command.data.toJSON())
        table.addRow(command.data.name, 'Guild', file)
      } else {
        console.warn(`Unable to publish ${command.data.name}`)
        table.addRow(command.data.name, '❌ Failed', file)
      }
      await client.slashcommands.set(command.data.name, command)
    })
  })

  const rest = new REST({ version: '10' }).setToken(process.env.token)

  const { clientId } = client.config
  const { guildId } = client.config;

  (async () => {
    try {
      console.info('Started refreshing application (/) commands.')
      await rest.put(Routes.applicationCommands(clientId), {
        body: GlobalCommands
      })

      if (guildId) {
        await rest.put(
          Routes.applicationGuildCommands(clientId, guildId),
          {
            body: GuildCommands
          }
        )
      }
      console.info(table.toString())
      console.info('Successfully reloaded application (/) commands.')
    } catch (err) {
      console.error(err)
    }
  })()
}
