// commnads/message/addBannedWord.js - AI生成

const Database = require("better-sqlite3");
const db = new Database("./database.db");

module.exports = {
    name: 'addBannedWord',
    aliases: ['addNgWord', "addng"],
    description: 'NGワードを追加します。',
    adminOnly: true,
    usage: '<NGワード> [deleteMessage (true/false)]',

    async execute(client, message, args) {
        if (!args[0]) {
            return message.reply({ 
                content: 'NGワードを指定してください。', 
                allowedMentions: { repliedUser: false } 
            });
        }

        const word = args[0];
        // デフォルトはfalse
        const deleteMessage = args[1] ? (args[1].toLowerCase() === 'true' ? 1 : 0) : 0;

        try {
            db.prepare('INSERT INTO BANNED_WORDS (word, counter, deleteMessage) VALUES (?, 0, ?)').run(word, deleteMessage);
            return message.reply({ 
                content: `NGワード "${word}" を追加しました。`, 
                allowedMentions: { repliedUser: false } 
            });
        } catch (error) {
            if (error.code === 'SQLITE_CONSTRAINT_PRIMARYKEY') {
                return message.reply({ 
                    content: `NGワード "${word}" は既に存在します。`, 
                    allowedMentions: { repliedUser: false } 
                });
            }
            console.error('NGワード追加エラー:', error);
            return message.reply({ 
                content: 'NGワードの追加中にエラーが発生しました。', 
                allowedMentions: { repliedUser: false } 
            });
        }
    },
};