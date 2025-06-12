// commands/message/help.js

const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'help',
    aliases: ['?'],
    description: '利用可能なコマンドのリストを表示します。',
    async execute(client, message, args) {
        const prefix = process.env.PREFIX || '!';

        const displayedCommands = new Set();
        const commandsList = [];

        for (const [commandName, cmd] of client.commands) {
            // adminOnly が true のコマンドはスキップ
            if (cmd.adminOnly || displayedCommands.has(cmd.data.name)) {
                continue;
            }

            if (cmd.data && cmd.data.name === commandName) {
                commandsList.push(`\`${prefix}${cmd.data.name}\` - ${cmd.data.description || '説明なし'}`);
                displayedCommands.add(cmd.data.name);
            }
        }

        const helpEmbed = new EmbedBuilder()
            .setColor(0x0099FF)
            .setTitle('利用可能なコマンド')
            .setDescription(commandsList.length > 0 ? commandsList.join('\n') : '現在、利用可能なコマンドはありません。')
            .setFooter({ text: `prefix: ${prefix}` });

        await message.reply({ embeds: [helpEmbed], allowedMentions: { repliedUser: false } });
    },
};