// commands/message/user.js

const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'user',
    description: '',
    aliases: ['userInfo', 'ui', 'userinfo'],
    usage: '',

    async execute(client, message, args) {

        const targetUser = ( message.mentions.users.first() || await client.users.fetch(args[0]).catch(() => null) ) || message.author;

        if (!targetUser) {
            return message.reply({ content: 'ユーザーを指定してください', allowedMentions: { repliedUser: false } });
        }

        const embed = new EmbedBuilder()
            .setColor(0x0099FF)
            .setAuthor({ name: targetUser.tag, iconURL: targetUser.displayAvatarURL({ size: 1024, dynamic: true }), url: 'https://discord.com/users/' + targetUser.id })
            .setDescription(`
                ID: ${targetUser.id}
                userName: ${targetUser.username}
                globalName: ${targetUser.globalName || '-'}
                bot: ${targetUser.bot ? 'はい' : 'いいえ'}
                アカウント作成: <t:${Math.floor(targetUser.createdTimestamp / 1000)}:F>
                サーバー参加: <t:${Math.floor(message.guild.members.cache.get(targetUser.id).joinedTimestamp / 1000)}:F>
                `)

        message.reply({ embeds: [embed], allowedMentions: { repliedUser: false } });

    },
};