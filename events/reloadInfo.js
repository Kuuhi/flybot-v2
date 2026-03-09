// events/reloadInfo.js

const { Events, EmbedBuilder } = require('discord.js');
const cron = require('node-cron');
const Database = require("better-sqlite3");
const db = new Database("./database.db");

module.exports = {
    name: Events.ClientReady,
    once: true,
    async execute(client) {

        cron.schedule("0 0 * * * *", async () => {
            const MESSAGE_URL_REGEX = /https?:\/\/discord\.com\/channels\/(\d+)\/(\d+)\/(\d+)/g;
            const matches = MESSAGE_URL_REGEX.exec(process.env.INFO_MESSAGE_URL);

            if (matches) {
                const [_, guildId, channelId, messageId] = matches;

                try {
                    const guild = await client.guilds.fetch(guildId);
                    const channel = await client.channels.fetch(channelId);
                    const fetchedMessage = await channel.messages.fetch(messageId);

                    const role = guild.roles.cache.get("875969584996446260");

                    const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
                    const statsRow = db.prepare(`SELECT SUM(count) as total FROM hourly_stats WHERE guildId = ? AND timestamp >= ?`).get(guildId, thirtyDaysAgo);
                    const totalMessages = statsRow?.total || 0;
                    const hoursIn30Days = 30 * 24;
                    const avg = (totalMessages / hoursIn30Days).toFixed(2);

                    const embed = new EmbedBuilder()
                        .setColor(0x0099FF)
                        .setAuthor({ name: guild.name + " ステータス", iconURL: guild.iconURL() })
                        .setDescription(`メンバー数: ${guild.memberCount}\n<@&875969584996446260>: ${role.members.size}\nメッセージ/時: **${avg}** msg/h\n-# ⌞直近30日のメッセージ数/30*24`)
                        .setFooter({ text: `最終更新: ${new Date().toLocaleString('ja-JP')}` });

                    await fetchedMessage.edit({ content: "", embeds: [embed], components: [] });
                } catch (error) {
                    console.error("reloadInfoの更新中にエラーが発生しました:", error);
                }
            }
        });
    },
};