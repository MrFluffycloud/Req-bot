const { Client, Collection } = require('discord.js')

const client = new Client({
  intents: 112623,
  allowedMentions: { parse: ['users', 'roles'], repliedUser: true }
})

const express = require('express')

const app = express()

const fs = require('fs')

require('dotenv').config()

app.get('/', (req, res) => {
  res.send('Running!')
})

app.listen(3000, () => {
  console.log("I'm online 24/7!!!")
})

client.commands = new Collection()
client.slashcommands = new Collection()
client.aliases = new Collection()
client.categories = fs.readdirSync('./commands/')
client.config = require('./config.js')
client.emotes = require('./emojis.js');

['slash_commands', 'commands', 'events'].forEach((handler) => {
  require(`./handlers/${handler}`)(client)
})

client.login(process.env.token)
