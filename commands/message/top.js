// commands/message/top.js

const { ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');

module.exports = {
  name: 'top',
  aliases: ['first'],
  adminOnly: false,
  description: 'チャンネルの一番上の方にメッセージを取得',

  async execute(client, message) {

    const fetchedMessages = await message.channel.messages.fetch({ after: '0', limit: 1 });

    if (!message.guild) return
    if (fetchedMessages.size === 0) return

    const firstMessage = fetchedMessages.first();

    const button = new ButtonBuilder()
      .setLabel('topへ')
      .setStyle(ButtonStyle.Link)
      .setURL(`https://discord.com/channels/${message.guild.id}/${message.channel.id}/${firstMessage.id}`); 

    const row = new ActionRowBuilder()
      .addComponents(button);

    return message.reply({
      components: [row],
      allowedMentions: { repliedUser: false }
    });

  },
};