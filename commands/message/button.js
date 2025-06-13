// commands/message/button.js

const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    name: 'button',
    description: 'buttonを生成(管理者)',
    adminOnly: true,
    usage: 'button <id> <tag> [color] [channelId] [message]',

    async execute(client, message, args) {

        if (!args[1]) return message.reply({ content: "因数不足```\nbutton <id> <tag> [color] [channelId] [message]```", allowedMentions: { parse: [] } })

        let buttonStyle = ButtonStyle.Secondary;

        if (args[2]) {
            const color = args[2].toLowerCase();
            switch (color) {
                case 'primary':
                case 'blue':
                case 'b':
                    buttonStyle = ButtonStyle.Primary;
                    break;
                case 'success':
                case 'green':
                case 'g':
                    buttonStyle = ButtonStyle.Success;
                    break;
                case 'danger':
                case 'red':
                case 'r':
                    buttonStyle = ButtonStyle.Danger;
                    break;
                case 'link':
                case 'url':
                    buttonStyle = ButtonStyle.Link;
                    break;
            }
        }

        const button = new ButtonBuilder()
            .setCustomId(args[0])
            .setLabel(args[1])
            .setStyle(buttonStyle);
        const row = new ActionRowBuilder()
            .addComponents(button);

        const channel = args[3] ? client.channels.cache.get(args[3]) : message.channel;

        try {
            await channel.send({
                content: args[4] || null,
                components: [row],
            });
            await message.react("✅");
        } catch (error) {
            console.error(error);
            message.reply({ content: "エラーが発生しました！", allowedMentions: { repliedUser: false } });
        }
    },
};