// commands/message/user.js

const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'user',
    description: '',
    aliases: ['userInfo', 'ui', 'userinfo'],
    usage: '',

    async execute(client, message, args) {

        let targetUser = message.mentions.users.first();
        
        if (!targetUser && args[0]) {
            targetUser = await client.users.fetch(args[0]).catch(() => null);
        }

        if (!targetUser && !args[0]) {
            targetUser = message.author;
        }

        if (!targetUser) {
            return message.reply({ content: 'ユーザーを指定してください', allowedMentions: { repliedUser: false } });
        }

        if (!targetUser.username) {
            return message.reply({ content: 'このアカウントは削除されているか、利用できません', allowedMentions: { repliedUser: false } });
        }

        const guildMember = message.guild.members.cache.get(targetUser.id);
        const joinedAt = guildMember?.joinedTimestamp ? `<t:${Math.floor(guildMember.joinedTimestamp / 1000)}:F>` : '取得できません';

        const embed = new EmbedBuilder()
            .setColor(0x0099FF)
            .setAuthor({ name: targetUser.tag, iconURL: targetUser.displayAvatarURL({ size: 1024, dynamic: true }), url: 'https://discord.com/users/' + targetUser.id })
            .setDescription(`ID: ${targetUser.id}\nuserName: ${targetUser.username}\nglobalName: ${targetUser.globalName || '-'}\nbot: ${targetUser.bot ? 'はい' : 'いいえ'}\nアカウント作成: <t:${Math.floor(targetUser.createdTimestamp / 1000)}:F>\nサーバー参加: ${joinedAt}`)

        message.reply({ embeds: [embed], allowedMentions: { repliedUser: false } });

    },
};