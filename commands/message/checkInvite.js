// commands/message/checkInvite.js

const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'checkInvite',
  aliases: ['ci','ii','infoInvite','infoinvite',checkinvite'],
  description: 'あとでかく',

  async execute(client, message, args) {
    const inviteLink = args[0];
    try {
      const invite = await client.fetchInvite(inviteLink);

      const exampleEmbed = new EmbedBuilder()
        .setColor(0x0099FF)
        .setTitle(`${invite.code}からの取得結果`)
        .setAuthor({ name: invite.guild.name, iconURL: invite.guild.iconURL() })
        .setDescription(`\`guildID    : ${invite.guild.id}\`\n\`guildName  : ${invite.guild.name}\`\n\`memberCount: ${invite.memberCount}\`\n\`ownerID    : ${invite.ownerId}\`\n\`code       : ${invite.code}\`\n\`channelName: ${invite.channel.name}\`\n\`channelID  : ${invite.channel.id}\``)

      await message.reply({
        embeds: [exampleEmbed],
        allowedMentions: { parse: [] }
      });
    } catch {
      await message.reply({
        content: 'データが取得できませんでした。',
        allowedMentions: { parse: [] }
      });
    }
  },
};