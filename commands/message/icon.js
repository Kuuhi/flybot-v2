// commands/message/icon.js

const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'icon',
    description: '',
    adminOnly: true,
    usage: '',

    async execute(client, message, args) {

        const targetUser = message.mentions.users.first() || await client.users.fetch(args[0]).catch(() => null);

        if (!targetUser) {
            return message.reply({ content: 'ユーザーを指定してください', allowedMentions: { repliedUser: false } });
        }

        if (!targetUser.displayAvatarURL()) {
            return message.reply({ content: 'そのユーザーはアイコンを設定していません', allowedMentions: { repliedUser: false } });
        }

        const embed = new EmbedBuilder()
            .setColor(0x0099FF)
            .setAuthor({ name: `${targetUser.tag} のアイコン` })
            .setImage(targetUser.displayAvatarURL({ size: 1024, dynamic: true }))

        message.reply({
            embeds: [embed],
            allowedMentions: { repliedUser: false }
        });
    },
};