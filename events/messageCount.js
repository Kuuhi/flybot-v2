// events/messageCount.js

const { Events } = require('discord.js');
const Database = require('better-sqlite3');
const db = new Database('./database.db');

module.exports = {
    name: Events.MessageCreate,

    execute(message) {
        if (message.author.bot) return;
        if (!message.guild) return;

        const userId = message.author.id;
        const guildId = message.guild.id;
        const year = new Date().getFullYear();

        try {
            db.prepare(`INSERT INTO message_counts (userId, guildId, year, count) VALUES (?, ?, ?, 1) ON CONFLICT(userId, guildId, year) DO UPDATE SET count = count + 1`).run(userId, guildId, year);
        } catch (error) {
            console.error('messageCount upsert error', error);
        }
    }
};