// commands/message/checkSpam.js

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

module.exports = {
    name: 'checkspam',
    aliases: ['spamcheck', 'spam'],
    adminOnly: true,
    description: '添付画像がスパムフィルターに引っかかるか調べる',

    async execute(client, message, args) {
        const adminRoleId = process.env.ADMIN_ROLE_ID;
        if (!message.member || !message.member.roles.cache.has(adminRoleId)) {
            return;
        }

        const registeredHashes = db.prepare('SELECT value FROM spam_assets WHERE type = ?').all('hash');
        const THRESHOLD = 15;
        let foundSpam = false;
        let reportLines = [];

        const content = message.content || '';
        const urls = (content.match(/(https?:\/\/[^\s>"'<]+)/g) || []).filter(u => u.length > 0);
        if (urls.length > 0) {
            const row = db.prepare('SELECT value FROM spam_assets WHERE type = ? AND value IN (' + urls.map(() => '?').join(',') + ')').get('url', ...urls);
            if (row) {
                foundSpam = true;
                reportLines.push(`URL \`${row.value}\` はスパムリストに登録されています。`);
            } else {
                reportLines.push(`付属URL: spam登録なし`);
            }
        }

        if (message.attachments.size === 0) {
            if (reportLines.length === 0) {
                return message.reply('画像を添付してください。');
            }
            return message.reply(reportLines.join('\n'));
        }

        for (const attachment of message.attachments.values()) {
            try {
                const currentHash = await getHash(attachment.url);
                let bestDist = Number.MAX_SAFE_INTEGER;
                for (const row of registeredHashes) {
                    const dist = getHammingDistance(currentHash, row.value);
                    if (dist < bestDist) bestDist = dist;
                    if (dist <= THRESHOLD) {
                        foundSpam = true;
                        reportLines.push(`画像 \`${attachment.url}\` はスパム画像に一致 (距離 ${dist})`);
                        break;
                    }
                }
                if (!foundSpam) {
                    reportLines.push(`画像 \`${attachment.url}\` はスパムではありません (最短距離 ${bestDist})`);
                }
            } catch (e) {
                reportLines.push(`画像 \`${attachment.url}\` のハッシュ計算中にエラー: ${e.message}`);
            }
        }

        await message.reply(reportLines.join('\n'));
    },
};
