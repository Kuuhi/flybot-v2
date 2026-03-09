const { Events } = require('discord.js');
const Database = require("better-sqlite3");
const db = new Database("./database.db");

db.prepare(`
    CREATE TABLE IF NOT EXISTS hourly_stats (
        guildId TEXT NOT NULL,
        timestamp INTEGER NOT NULL,
        count INTEGER DEFAULT 0,
        PRIMARY KEY (guildId, timestamp)
    )
`).run();

module.exports = {
    name: Events.MessageCreate,
    async execute(message) {
        if (message.guildId !== "871295203259056208" || message.author.bot) return;

        const now = new Date();
        now.setMinutes(0, 0, 0);
        const hourlyTimestamp = now.getTime();

        try {
            const stmt = db.prepare(`
                INSERT INTO hourly_stats (guildId, timestamp, count)
                VALUES (?, ?, 1)
                ON CONFLICT(guildId, timestamp) DO UPDATE SET count = count + 1
            `);
            stmt.run(message.guildId, hourlyTimestamp);
        } catch (error) {
            console.error("統計データの保存中にエラーが発生しました:", error);
        }
    },
};