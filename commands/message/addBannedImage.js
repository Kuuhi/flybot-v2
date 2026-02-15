// commands/message/addBannedImage.js

const Database = require("better-sqlite3");
const db = new Database("./database.db");
const { imageHash } = require('image-hash');

const getHash = (url) => {
    return new Promise((resolve, reject) => {
        imageHash(url, 16, true, (err, data) => {
            if (err) return reject(err);
            resolve(data);
        });
    });
};

module.exports = {
    name: 'addBannedImage',
    aliases: ['addSpamImage', "addngi"],
    description: 'スパム画像/URLを追加/削除します。サブコマンド: add/remove。添付画像は自動でハッシュ化して登録します。',
    adminOnly: true,
    usage: '<add|remove> [url|hash] <value>',

    async execute(client, message, args) {
        const sub = args[0]; // add / remove
        if (!sub) {
            return message.reply({ content: 'サブコマンドを指定してください (add/remove)。', allowedMentions: { repliedUser: false } });
        }

        try {
            if (sub === 'add') {
                // 引数からURL/ハッシュを受け取る（型を明示していなければ自動判定）
                const maybeType = args[1];
                const maybeValue = args[2] || args[1];

                if (maybeValue && (maybeType === 'url' || maybeType === 'hash')) {
                    const type = maybeType === 'url' ? 'url' : 'hash';
                    db.prepare('INSERT OR IGNORE INTO spam_assets (type, value) VALUES (?, ?)').run(type, maybeValue);
                } else if (maybeValue) {
                    // 型が指定されていない場合、http(s)で始まればURL、それ以外はハッシュとみなす
                    const inferredType = /^https?:\/\//i.test(maybeValue) ? 'url' : 'hash';
                    db.prepare('INSERT OR IGNORE INTO spam_assets (type, value) VALUES (?, ?)').run(inferredType, maybeValue);
                }

                // 現在のメッセージの添付画像があればハッシュ化して登録
                if (message.attachments && message.attachments.size > 0) {
                    for (const attachment of message.attachments.values()) {
                        try {
                            const hash = await getHash(attachment.url);
                            db.prepare('INSERT OR IGNORE INTO spam_assets (type, value) VALUES (?, ?)').run('hash', hash);
                        } catch (err) {
                            console.error('画像ハッシュ作成エラー:', err);
                        }
                    }
                }

                // 返信先のメッセージがあれば、その添付画像もハッシュ化して登録
                if (message.reference) {
                    try {
                        const repliedTo = await message.channel.messages.fetch(message.reference.messageId);
                        if (repliedTo.attachments && repliedTo.attachments.size > 0) {
                            for (const attachment of repliedTo.attachments.values()) {
                                try {
                                    const hash = await getHash(attachment.url);
                                    db.prepare('INSERT OR IGNORE INTO spam_assets (type, value) VALUES (?, ?)').run('hash', hash);
                                } catch (err) {
                                    console.error('返信先の画像ハッシュ作成エラー:', err);
                                }
                            }
                        }
                    } catch (err) {
                        console.error('返信先メッセージ取得エラー:', err);
                    }
                }

                return message.reply({ content: 'スパムデータを登録しました。', allowedMentions: { repliedUser: false } });

            } else if (sub === 'remove') {
                const value = args[1];
                if (!value) {
                    return message.reply({ content: '削除する値を指定してください。', allowedMentions: { repliedUser: false } });
                }
                const info = db.prepare('DELETE FROM spam_assets WHERE value = ?').run(value);
                return message.reply({ content: `指定されたデータを削除しました（削除件数: ${info.changes}）。`, allowedMentions: { repliedUser: false } });
            } else {
                return message.reply({ content: 'サブコマンドは add または remove のいずれかを指定してください。', allowedMentions: { repliedUser: false } });
            }
        } catch (error) {
            console.error('addBannedImage エラー:', error);
            return message.reply({ content: '処理中にエラーが発生しました。コンソールを確認してください。', allowedMentions: { repliedUser: false } });
        }
    },
};