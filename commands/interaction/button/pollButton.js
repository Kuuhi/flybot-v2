// commands/interaction/button/pollButton.js

const { EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle } = require('discord.js');
const sqlite3 = require("sqlite3");
const db = new sqlite3.Database("./database.db");

module.exports = {
    customId: 'pollButton',
    description: 'アンケートボタンの処理',

    async execute(client, interaction) {
        const customId = interaction.customId; // 'pollButton_0' など
        const action = customId.split('_')[1]; // '0', '1', 'delete' を取得

        if (action === 'delete') {
            if (!interaction.member.roles.cache.has(process.env.ADMIN_ROLE_ID)) {
                return interaction.reply({ content: '管理権限が必要です。', flags: 64 });
            }
            await interaction.message.delete();
            return interaction.reply({ content: 'アンケートを削除しました。', flags: 64 });
        }

        db.get(`SELECT * FROM polls WHERE url = ?`, [interaction.message.url], async (err, row) => {
            if (err || !row) {
                return interaction.reply({ content: 'データが見つかりません。', flags: 64 });
            }

            const options = JSON.parse(row.options);
            let votes = JSON.parse(row.votes || '{}');
            const choiceIndex = parseInt(action);

            // 前回の投票を取得
            const previousChoice = votes[interaction.user.id];

            // 投票反映
            votes[interaction.user.id] = choiceIndex;
            const totalVotes = Object.keys(votes).length;

            // 各選択肢の集計
            const counts = options.map((_, idx) => 
                Object.values(votes).filter(v => v === idx).length
            );

            const embed = new EmbedBuilder()
                .setColor(0x00FF99)
                .setTitle('📊 アンケート')
                .setDescription(`**${row.question}**`)
                .setFooter({ text: `合計投票数: ${totalVotes}票` });

            options.forEach((opt, idx) => {
                const count = counts[idx];
                const percentage = totalVotes > 0 ? ((count / totalVotes) * 100).toFixed(1) : 0;
                embed.addFields({ name: opt, value: `${count}票 (${percentage}%)`, inline: true });
            });

            await interaction.message.edit({ embeds: [embed] });
            
            db.run(`UPDATE polls SET votes = ? WHERE url = ?`, [JSON.stringify(votes), interaction.message.url]);
            
            await interaction.reply({ content: `${options[choiceIndex]} に投票しました！`, flags: 64 });
        });
    }
};