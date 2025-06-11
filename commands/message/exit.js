// commands/message/exit.js

const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'exit',
    aliases: ['reboot'],
    adminOnly: true,
    description: 'exitを呼び出すよ',
    
    async execute(client, message, args) {
    if (!this.adminIds.includes(message.author.id)) return
    await message.react("✅")
    const exitCode = Number(args[0]) || 0;
    process.exit(exitCode);
  },
};