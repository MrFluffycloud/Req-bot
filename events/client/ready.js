const { Events, ActivityType } = require('discord.js')
const { YamlDatabase } = require('wio.db')
const status = require('../../status.json')

module.exports = {
  name: Events.ClientReady,
  once: false,
  async execute (client) {
    client.db = new YamlDatabase({
      databasePath: `./data/${client.user.id}.yml`
    })

    console.log(`Logged in as ${client.user.username}`)
    client.user.setActivity(status.status, {
      name: status.status,
      type: ActivityType.Watching
    })
  }
}
