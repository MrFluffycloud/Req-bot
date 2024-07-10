const fs = require('fs')
const AsciiTable = require('ascii-table')

const table = new AsciiTable('Events')
table.setHeading('Event', 'Stats', 'File')
module.exports = async (client) => {
  try {
    let theevents
    fs.readdirSync('./events/').forEach((dir) => {
      theevents = fs
        .readdirSync(`./events/${dir}/`)
        .filter((file) => file.endsWith('.js'))
      for (const file of theevents) {
        const event = require(`../events/${dir}/${file}`)
        try {
          if (event.once) {
            client.once(event.name, (...args) => event.execute(...args, client))
          } else {
            client.on(event.name, (...args) => event.execute(...args, client))
          }
          table.addRow(event.name, '✅', file)
        } catch (err) {
          console.error(err)
          table.addRow(event.name, '❌', file)
        }
      }
    })
  } finally {
    console.info(table.toString())
  }
}
