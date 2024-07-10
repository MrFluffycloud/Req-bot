if (process.argv.length === 2) {
  console.error('Expected at least one argument!')
  console.info('Run: node emoji.js <GuildID>')
  console.info(
    '<GuildID> must be the ID of a server which the bot got access to. The bot will upload the emojis to set Guild.'
  )
  process.exit(1)
}

const { Client, GatewayIntentBits } = require('discord.js')
const fs = require('fs')
const path = require('path')

const client = new Client({
  intents: [
    GatewayIntentBits.GuildEmojisAndStickers,
    GatewayIntentBits.Guilds
  ]
})

require('dotenv').config()

console.log('Guild ID Provided', process.argv[2])
client.once('ready', async (c) => {
  const guild = client.guilds.cache.get(process.argv[2])
  if (!guild) {
    console.error('Guild Was not found')
    return process.exit(1)
  }

  const emojis = [
    {
      name: 'clock',
      url: 'https://cdn3.emoji.gg/emojis/5044-clock-running.gif'
    },
    {
      name: 'gift',
      url: 'https://cdn3.emoji.gg/emojis/3899-gift.gif'
    },
    {
      name: 'tada',
      url: 'https://cdn3.emoji.gg/emojis/2659-tada-purple.gif'
    },
    {
      name: 'tick',
      url: 'https://cdn3.emoji.gg/emojis/8349-verify.png'
    },
    {
      name: 'cross',
      url: 'https://cdn3.emoji.gg/emojis/7060-vega-x.png'
    },
    {
      name: 'warning',
      url: 'https://cdn3.emoji.gg/emojis/3059-cautionwarning.png'
    },
    {
      name: 'exclm',
      url: 'https://cdn3.emoji.gg/emojis/6011-exclamationviolett.gif'
    }
  ]

  const x = await Promise.all(
    emojis.map((em) => guild.emojis
      .create({
        attachment: em.url,
        name: em.name
      })
      .then((emoji) => ({
        name: em.name,
        emoji: emoji.toString()
      })))
  ).then((resolvedEmojis) => resolvedEmojis.reduce((acc, curr) => {
    acc[curr.name] = curr.emoji
    return acc
  }, {}))

  await fs.writeFileSync(
    path.resolve('./emojis.js'),
    `module.exports = ${JSON.stringify(x)}`
  )
  await console.info('Added Emojis Successfully')
  await process.exit(0)
})

client.login(process.env.token)
