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

        for (const [key, cmd] of client.prefixCommands) {
            if (cmd.adminOnly) { // adminOnly が true のコマンドはスキップ
                continue;
            }

            if (!displayedCommands.has(cmd.name)) {
                let aliasInfo = '';
                if (cmd.aliases && cmd.aliases.length > 0) {
                    aliasInfo = `${cmd.aliases.map(a => `\`${a}\``).join(', ')})`;
                }
                commandsList.push(`\`${prefix}${cmd.name}\` - ${cmd.description || '説明なし'}${aliasInfo}`);
                displayedCommands.add(cmd.name);
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