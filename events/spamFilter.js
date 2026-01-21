// events/spamFilter.js

const { Events, EmbedBuilder } = require('discord.js');
const Database = require("better-sqlite3");
const db = new Database("./database.db");
const { imageHash } = require('image-hash');

const getHash = (url) => {
    return new Promise((resolve, reject) => {
        imageHash(url, 16, true, (error, data) => {
            if (error) reject(error);
            resolve(data);
        });
    });
};

module.exports = {
    name: Events.MessageCreate,
    once: false,
    async execute(message) {

        if (message.author.bot || !message.guild) return;

        const member = message.member;
        if (!member) return;

        const isNewUser = (Date.now() - member.joinedTimestamp) < 7 * 24 * 60 * 60 * 1000;
        if (!isNewUser) return;

        try {
            let isSpam = false;

            // URLチェック
            const urls = message.content.match(/(https?:\/\/[^\s]+)/g) || [];
            for (const url of urls) {
                const row = db.prepare('SELECT 1 FROM spam_assets WHERE type = ? AND value = ?').get('url', url);
                if (row) {
                    isSpam = true;
                    break;
                }
            }

            // 画像ハッシュチェック
            if (!isSpam && message.attachments.size > 0) {
                for (const attachment of message.attachments.values()) {
                    const currentHash = await getHash(attachment.url);
                    const row = db.prepare('SELECT 1 FROM spam_assets WHERE type = ? AND value = ?').get('hash', currentHash);
                    if (row) {
                        isSpam = true;
                        break;
                    }
                }
            }

            // スパム判定時のアクション
            if (isSpam) {
                await message.delete().catch(console.error);
                await member.ban({
                    reason: '登録済みスパム画像/URLの投稿（1週間以内に参加した未確認のユーザー）',
                    deleteMessageSeconds: 604800
                }).catch(console.error);

                const logChannelId = process.env.LOG_CHANNEL_ID;
                const logChannel = message.guild.channels.cache.get(logChannelId);
                if (logChannel) {
                    const embed = new EmbedBuilder()
                        .setColor(0xFF0000)
                        .setTitle('スパムユーザー自動BAN')
                        .addFields(
                            { name: 'ユーザー', value: `${member.user.tag} (<@${member.user.id}>)`, inline: true },
                            { name: '理由', value: '登録済みスパム画像/URLの投稿（1週間以内に参加した未確認のユーザー）' },
                            { name: 'メッセージ内容', value: message.content || '添付ファイルのみ' }
                        )
                        .setTimestamp();

                    await logChannel.send({ embeds: [embed] });
                }

                console.log(`[Auto-BAN] ${member.user.tag} をスパム検知によりBANしました。`);
            }
        } catch (err) {
            console.error('Spam Check Error:', err);
        }
    }
};