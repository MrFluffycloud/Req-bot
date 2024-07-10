const { readdirSync } = require('fs')
const ascii = require('ascii-table')

const table = new ascii('Commands')
table.setHeading('File', 'Load status', 'Command')

module.exports = (client) => {
  readdirSync('./msg-Commands/').forEach((dir) => {
    const commands = readdirSync(`./msg-Commands/${dir}/`).filter((file) => file.endsWith('.js'))

    for (const file of commands) {
      const pull = require(`../msg-Commands/${dir}/${file}`)
      if (pull.name) {
        client.commands.set(pull.name, pull)
        table.addRow(file, '🟢', pull.name)
      } else {
        table.addRow(file, '🔴')
        table.addRow(
          '-> Error',
          'missing a help.name, or help.name is not a string.'
        )
        continue
      }

      if (pull.aliases && Array.isArray(pull.aliases)) {
        pull.aliases.forEach((alias) => {
          client.aliases.set(alias, pull.name)
        })
      }
    }
  })
  console.log(table.toString())
}
