// commands/message/reloadInfo.js

const { EmbedBuilder } = require('discord.js');
const Database = require("better-sqlite3");
const db = new Database("./database.db");

module.exports = {
    name: 'reload',
    aliases: ['reloadInfo', 'ri'],
    description: 'ステータスメッセージを手動で更新します',
    adminOnly: true,

    async execute(client, message, args) {

        const MESSAGE_URL_REGEX = /https?:\/\/discord\.com\/channels\/(\d+)\/(\d+)\/(\d+)/g;
        const infoUrl = process.env.INFO_MESSAGE_URL;

        if (!infoUrl) return message.reply("`INFO_MESSAGE_URL` が設定されていません。");

        const matches = MESSAGE_URL_REGEX.exec(infoUrl);

        if (matches) {
            const [_, guildId, channelId, messageId] = matches;

            try {
                const guild = await client.guilds.fetch(guildId);
                const channel = await client.channels.fetch(channelId);
                const fetchedMessage = await channel.messages.fetch(messageId);

                const roleId = "875969584996446260";
                const role = guild.roles.cache.get(roleId);

                const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
                const statsRow = db.prepare(`SELECT SUM(count) as total FROM hourly_stats WHERE guildId = ? AND timestamp >= ?`).get(guildId, thirtyDaysAgo);

                const totalMessages = statsRow?.total || 0;
                const hoursIn30Days = 30 * 24;
                const avg = (totalMessages / hoursIn30Days).toFixed(2);

                const embed = new EmbedBuilder()
                    .setColor(0x0099FF)
                    .setAuthor({ name: guild.name + " ステータス", iconURL: guild.iconURL() })
                    .setDescription(`メンバー数: ${guild.memberCount}\n<@&${roleId}>: ${role ? role.members.size : "取得失敗"}\nメッセージ/時: ${avg} msg/h\n-# ⌞直近30日のメッセージ数/30*24`)
                    .setFooter({ text: `最終更新: ${new Date().toLocaleString('ja-JP')}` });

                await fetchedMessage.edit({ content: "", embeds: [embed], components: [] });

            } catch (error) {
                console.error(error);
                await message.reply(`❌ 更新中にエラーが発生しました:\n\`\`\`${error.message}\`\`\``);
            }
        } else {
            await message.reply("URLの解析に失敗しました。`INFO_MESSAGE_URL` の形式を確認してください。");
        }
    },
};