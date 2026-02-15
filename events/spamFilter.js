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

        function getHammingDistance(h1, h2) {
            if (h1.length !== h2.length) return 999;
            let distance = 0;
            for (let i = 0; i < h1.length; i++) {
                let xor = parseInt(h1[i], 16) ^ parseInt(h2[i], 16);
                while (xor > 0) {
                    if (xor & 1) distance++;
                    xor >>= 1;
                }
            }
            return distance;
        }

        try {
            let isSpam = false;
            let spamReason = '';
            let spamDistance = null;
            let spamDetail = '';

            // URLチェック
            const content = message.content || '';
            const urls = (content.match(/(https?:\/\/[^\s>"'<]+)/g) || []).filter(url => url.length > 0);
            if (urls.length > 0) {
                const row = db.prepare('SELECT value FROM spam_assets WHERE type = ? AND value IN (' + urls.map(() => '?').join(',') + ')').get('url', ...urls);
                if (row) {
                    isSpam = true;
                    spamReason = 'スパムURL検出';
                    spamDetail = row.value;
                }
            }

            // 画像ハッシュチェック
            if (!isSpam && message.attachments.size > 0) {
                const registeredHashes = db.prepare('SELECT value FROM spam_assets WHERE type = ?').all('hash');

                for (const attachment of message.attachments.values()) {
                    try {
                        const currentHash = await getHash(attachment.url);

                        for (const row of registeredHashes) {
                            const distance = getHammingDistance(currentHash, row.value);

                            const THRESHOLD = 15;
                            if (distance <= THRESHOLD) {
                                isSpam = true;
                                spamReason = 'スパム画像検出';
                                spamDistance = distance;
                                spamDetail = attachment.name || attachment.url;
                                break;
                            }
                        }
                        if (isSpam) break;
                    } catch (hashError) {
                        console.warn(`ハッシュ計算エラー (${attachment.name || attachment.url}):`, hashError.message);
                        continue;
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
                            { name: '理由分類', value: spamReason, inline: true },
                            { name: '詳細', value: '1週間以内に参加した未確認のユーザー' },
                            { name: '検出内容', value: spamDetail || '不明', inline: true },
                            { name: 'メッセージ内容', value: content.substring(0, 1024) || '添付ファイルのみ' },
                            { name: 'ハッシュ距離', value: spamDistance !== null ? spamDistance.toString() : '該当なし', inline: true }
                        )
                        .setTimestamp();

                    await logChannel.send({ embeds: [embed] });
                }

                console.log(`[Auto-BAN] ${member.user.tag} をスパム検知によりBANしました。[${spamReason}]`);
            }
        } catch (err) {
            console.error('Spam Check Error:', err);
        }
    }
};