// commands/message/top.js

const { ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');

module.exports = {
  name: 'top',
  description: 'チャンネルの一番上の方にメッセージを取得',

  async execute(client, message, args) {

    const fetchedMessages = await message.channel.messages.fetch({ after: '0', limit: 1 });

    if (!message.guild) {
      return message.reply({ content: 'このコマンドはサーバー内でのみ使用できます', allowedMentions: { repliedUser: false } });
    }

    if (fetchedMessages.size === 0) {
      return message.reply({ content: 'このチャンネルにはまだメッセージがありません', allowedMentions: { repliedUser: false } });
    }

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