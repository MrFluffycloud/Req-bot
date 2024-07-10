const { Events, EmbedBuilder } = require('discord.js')

module.exports = {
  name: Events.InteractionCreate,
  once: false,
  async execute (interaction, client) {
    if (!interaction.isModalSubmit()) return
    if (interaction.customId.startsWith('apply')) {
      const formName = interaction.customId.split(/-/g)[1]
      const ff = interaction.fields.fields
      let data = client.db.get(`${interaction.guild.id}.forms`)
      if (!data || data.length <= 0) {
        return await interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setDescription(
                `${client.emotes.cross} Form not found.`
              )
              .setColor('Red')
          ]
        })
      }
      data = data.filter((x) => x.name == formName)[0]

      const embed = new EmbedBuilder()
        .setTitle(`New Response for **${formName}** form.`)
        .setColor('Blurple')
        .setAuthor({
          name: interaction.user.username,
          iconURL: interaction.user.avatarURL()
        })
        .addFields(
          {
            name: 'User ID',
            value: `${interaction.user.id}`
          },
          {
            name: 'Username',
            value: `${interaction.user.username}`
          }
        )

      ff.forEach((element) => {
        if (element.value && element.value.length > 0) {
          embed.addFields({
            name: `${
              data.questions[element.customId.split(/-/g)[1]]
            }`,
            value: `${element.value}`
          })
        }
      })

      await interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription(`${client.emotes.tick} Sent Form.`)
            .setColor('Green')
        ]
      })

      const chnl = await interaction.guild.channels.fetch(data.channel)

      chnl.send({
        embeds: [embed]
      })
    }
  }
}
