// commands/message/helpAdvance.js

const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'helpAdvance',
    aliases: ['?+','help_Advance','help_advance', 'help+'],
    description: '利用可能なコマンドのリストを表示します。',
    async execute(client, message, args) {
        const prefix = process.env.PREFIX || '!';

        const displayedCommands = new Set();
        const commandsList = [];

        for (const [key, cmd] of client.prefixCommands) {
            if (!displayedCommands.has(cmd.name) && cmd.adminOnly) {
                commandsList.push(`\`${prefix}${cmd.name}\` - (管理者のみ)${cmd.description || '説明なし'}`);
                displayedCommands.add(cmd.name);
            }

            if (!displayedCommands.has(cmd.name)) {
                commandsList.push(`\`${prefix}${cmd.name}\` - ${cmd.description || '説明なし'}`);
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