const {
  Events,
  EmbedBuilder,
  PermissionFlagsBits,
  PermissionsBitField
} = require('discord.js')
const ms = require('enhanced-ms')

const cooldown = {}

module.exports = {
  name: Events.MessageCreate,
  once: false,
  async execute (message, client) {
    try {
      if (message.author.bot) return
      if (!message.guild) return

      const { prefix } = client.config

      if (!message.content.startsWith(prefix)) return

      if (!message.member) {
        return (message.member =					await message.guild.members.members.fetch(message))
      }

      const args = message.content
        .slice(prefix.length)
        .trim()
        .split(/ +/g)
      const cmd = args.shift().toLowerCase()

      if (cmd.length === 0) return

      let command = client.commands.get(cmd)
      if (!command) { command = client.commands.get(client.aliases.get(cmd)) }
      if (!command) return

      // -------------------------------------------- P E R M I S S I O N -------------------------------------------

      if (command.botPermissions || command.userPermissions) {
        if (
          command.botPermissions &&
					command.botPermissions.length > 0
        ) {
          const neededBotPerms = []

          command.botPermissions.forEach((p) => {
            if (
              !message.guild.members.me.permissions.has(
                PermissionsBitField.resolve(p)
              ) ||
							!message.channel
							  .permissionsFor(message.guild.members.me)
							  .has(PermissionsBitField.resolve(p))
            ) {
              return neededBotPerms.push(p)
            }
          })

          if (neededBotPerms.length > 0) {
            if (
              message.channel
                .permissionsFor(message.guild.members.me)
                .has(PermissionFlagsBits.EmbedLinks)
            ) {
              const noPermEmbed = new EmbedBuilder()
                .setColor('#2f3136')
                .setTitle('Invalid Permission(s)')
                .setDescription(
                  'I don\'t have sufficient permission(s)'
                )
                .addFields({
                  name: 'Permission(s) Required!',
                  value: `\`${neededBotPerms.join('\n-')}\``
                })
                .setFooter({
                  text: 'Moderation',
                  iconURL: client.user.avatarURL()
                })
                .setTimestamp()
              return message.reply({ embeds: [noPermEmbed] })
            }
            if (
              !message.channel
                .permissionsFor(message.guild.members.me)
                .has(PermissionFlagsBits.EmbedLinks)
            ) {
              return message.reply(
                `I need \`${neededBotPerms.join(
                  '`, `'
                )}\` permission(s) to execute the command!`
              )
            }
          }
        }
        // ------------

        if (
          command.userPermissions &&
					command.userPermissions.length > 0
        ) {
          const neededPerms = []
          command.userPermissions.forEach((p) => {
            if (
              !message.channel
                .permissionsFor(message.member)
                .has(PermissionsBitField.resolve(p))
            ) {
              return neededPerms.push(p)
            }
          })

          if (neededPerms.length > 0) {
            if (
              message.channel
                .permissionsFor(message.guild.members.me)
                .has(PermissionFlagsBits.EmbedLinks)
            ) {
              const noPermEmbed = new EmbedBuilder()
                .setColor('#2f3136')
                .setTitle('Invalid Permission(s)')
                .setDescription(
                  'You don\'t have that permission(s)'
                )
                .addFields({
                  name: 'Permission(s) Required!',
                  value: `\`${neededPerms.join('\n-')}\``
                })
                .setFooter({
                  text: 'Moderation',
                  iconURL: client.user.avatarURL()
                })
                .setTimestamp()
              return message.reply({ embeds: [noPermEmbed] })
            }
            if (
              !message.channel
                .permissionsFor(message.guild.members.me)
                .has(PermissionFlagsBits.EmbedLinks)
            ) {
              return message.reply(
                `You need \`${neededPerms.join(
                  '`, `'
                )}\` permission(s) to execute the command!`
              )
            }
          }
        }
      }

      // ---------------------------------------------O W N E R ----------------------------------------------------------

      if (command.ownerOnly) {
        if (!client.config.ownerID.includes(message.author.id)) {
          return message.reply(
            'This command can only be use by owner :C'
          )
        }
      }

      // ------------------------------------------------------COOLDOWN SYSTEM---------------------------------------------

      let uCooldown = cooldown[message.author.id]

      if (!uCooldown) {
        cooldown[message.author.id] = {}
        uCooldown = cooldown[message.author.id]
      }

      const time = uCooldown[command.name] || 0

      if (time && time > Date.now()) {
        return message.reply(
          `You can again use this command in ${ms(
            time - Date.now()
          )} second(s)`
        )
      }

      cooldown[message.author.id][command.name] =				Date.now() + command.cooldown

      // -----------------------------------------------------------------------------------------------------------------

      if (command) command.run(client, message, args)
    } catch (e) {
      message.reply('Ran into an error while running that command')
      console.error(e)
    }
  }
}
