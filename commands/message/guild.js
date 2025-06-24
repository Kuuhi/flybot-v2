// commands/message/guild.js

const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'guild',
    description: '',
    adminOnly: true,
    aliases: ['guildInfo', 'gi', 'guildinfo', 'server', 'serverInfo', 'si', 'serverinfo'],
    usage: '',

    async execute(client, message, args) {

        const guild = message.guild;
        
        if (!guild) {
            return message.reply({ content: 'このコマンドはサーバー内でのみ使用できます', allowedMentions: { repliedUser: false } });
        }

        const embed = new EmbedBuilder()
            .setColor(0x0099FF)
            .setAuthor({ name: guild.name, iconURL: guild.iconURL({ size: 1024, dynamic: true }) })
            .setDescription(`
                ID: ${guild.id}
                名前: ${guild.name}
                オーナー: <@${guild.ownerId}> ([${guild.ownerId}](https://discord.com/users/${guild.ownerId}))
                メンバー数: ${guild.memberCount}
                作成日: <t:${Math.floor(guild.createdTimestamp / 1000)}:F>
                サーバーの地域: ${guild.preferredLocale}
            `)

        message.reply({ embeds: [embed], allowedMentions: { repliedUser: false } });

    },
};