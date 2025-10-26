// commands/message/removeBannedWord.js

const Database = require("better-sqlite3");
const db = new Database("./database.db");

module.exports = {
    name: 'removeBannedWord',
    description: 'NGワードを削除します。',
    adminOnly: true,
    usage: '<NGワード>',

    async execute(client, message, args) {
        if (!args[0]) {
            return message.reply({ 
                content: '削除するNGワードを指定してください。', 
                allowedMentions: { repliedUser: false } 
            });
        }

        const word = args[0];

        const result = db.prepare('DELETE FROM BANNED_WORDS WHERE word = ?').run(word);

        if (result.changes === 0) {
            return message.reply({ 
                content: `NGワード "${word}" は見つかりませんでした。`, 
                allowedMentions: { repliedUser: false } 
            });
        }
        return message.reply({ 
            content: `NGワード "${word}" を削除しました。`, 
            allowedMentions: { repliedUser: false } 
        });
    }
};