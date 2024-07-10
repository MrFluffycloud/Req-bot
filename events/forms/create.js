const { Events, EmbedBuilder } = require('discord.js')

module.exports = {
  name: Events.InteractionCreate,
  once: false,
  async execute (interaction, client) {
    if (!interaction.isModalSubmit()) return
    if (interaction.customId.startsWith('forms')) {
      const formName = interaction.customId.split(/-/g)[1]
      const channel = client.db.get(`${interaction.guild.id}.frms.${formName}`)
      const ff = interaction.fields.fields
      const questions = []
      const embed = new EmbedBuilder()
        .setDescription(
          `${client.emotes.tick} Created new form, **${formName}**`
        )
        .addFields({ name: 'Channel:', value: `<#${channel}>` })
        .setColor('Green')

      ff.forEach((element) => {
        if (element.value && element.value.length > 0) {
          questions.push(element.value)
          embed.addFields({
            name: `Question **${questions.length}**`,
            value: `${element.value}`
          })
        }
      })

      client.db.push(`${interaction.guild.id}.forms`, {
        name: formName,
        channel,
        questions
      })

      client.db.delete(`${interaction.guild.id}.frms.${formName}`)
      await interaction.reply({
        embeds: [embed]
      })

      const chnl = await interaction.guild.channels.fetch(channel)

      chnl.send({
        embeds: [
          new EmbedBuilder()
            .setDescription(
              `${client.emotes.tick} Response for **${formName}** form will be sent here!`
            )
            .setColor('Green')
        ]
      })
    }
  }
}
