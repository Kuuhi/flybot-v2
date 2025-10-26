// events/profanityFilter.js

const { Events, EmbedBuilder } = require('discord.js');
const Database = require("better-sqlite3");
const db = new Database("./database.db");

// NGワードのキャッシュ
let bannedWordsCache = null;
let lastCacheUpdate = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5分

module.exports = {
    name: Events.MessageCreate,

    async execute(message) {
        if (message.author.bot) return;

        // キャッシュの更新確認
        const now = Date.now();
        if (!bannedWordsCache || now - lastCacheUpdate > CACHE_TTL) {
            bannedWordsCache = db.prepare('SELECT * FROM BANNED_WORDS').all();
            lastCacheUpdate = now;
        }

        for (const entry of bannedWordsCache) {
            try {
                const word = entry.word;
                const deleteMessage = entry.deleteMessage;

                const escapedWord = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                const regex = new RegExp(`\\b${escapedWord}\\b`, 'i');

                if (regex.test(message.content)) {

                    const logChannelId = process.env.LOG_CHANNEL_ID;
                    const logChannel = message.guild.channels.cache.get(logChannelId);

                    if (logChannel) {
                        const embed = new EmbedBuilder()
                            .setColor(0xFF0000)
                            .setTitle('禁止用語の検出')
                            .addFields(
                                { name: 'ユーザー', value: `${message.author.tag} (<@${message.author.id}>)`, inline: true },
                                { name: 'チャンネル', value: `<#${message.channel.id}>`, inline: true },
                                { name: 'メッセージ内容', value: message.content },
                                { name: '対象ワード', value: word },
                                { name: '自動措置', value: deleteMessage ? 'メッセージ削除' : 'なし' }
                            )
                            .setTimestamp();

                        await logChannel.send({ embeds: [embed] });
                    }

                    if (deleteMessage) {
                        await message.delete();
                        console.log(`Deleted message containing banned word: ${word}`);
                    }

                    db.prepare('UPDATE BANNED_WORDS SET counter = counter + 1 WHERE word = ?').run(word);

                    break;
                }
            } catch (regexError) {
                console.error('Regex creation failed:', regexError);
                continue;
            }
        }
    },
};