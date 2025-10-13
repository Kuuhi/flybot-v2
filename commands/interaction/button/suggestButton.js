// commands\interaction\button\suggestButton.js

const { EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle } = require('discord.js');

const sqlite3 = require("sqlite3");
const db = new sqlite3.Database("./database.db");

module.exports = {
    customId: 'suggestButton',
    description: '',

    async execute(client, interaction, args) {
        
        if (args[0] === 'delete') {
            if (!interaction.member.roles.cache.has(process.env.ADMIN_ROLE_ID)) {
                return interaction.reply({ content: 'このボタンは管理者のみが使用できます', flags: 64 });
            }

            await interaction.message.delete();
            return interaction.reply({ content: '提案を削除しました。', flags: 64 });
        }
        db.get(`SELECT * FROM suggestion WHERE url LIKE ?`, interaction.message.url, (err, date) => {
            if (err) {
                return interaction.reply({ content: 'データベースエラーが発生しました。', ephemeral: true });
            }
            if (!date) {
                return interaction.reply({ content: '提案データが見つかりません。', ephemeral: true });
            }

            date.agree = JSON.parse(date.agree || '[]');
            date.disagree = JSON.parse(date.disagree || '[]');

        });

        db.get(`SELECT * FROM suggestion WHERE url LIKE ?`, interaction.message.url, (err, date) => {

            date.agree = JSON.parse(date.agree || '[]');
            date.disagree = JSON.parse(date.disagree || '[]');


            if (date.agree.includes(interaction.user.id) || date.disagree.includes(interaction.user.id)) {
                return interaction.reply({ content: '投票済みです！', flags: 64 });
            }

            if (args[0] === 'agree') {
                if (!date.isVotingActive) {
                    return interaction.reply({ content: '投票は終了しています。', ephemeral: true });
                }
                date.agree.push(interaction.user.id);
            } else if (args[0] === 'disagree') {
                if (!date.isVotingActive) {
                    return interaction.reply({ content: '投票は終了しています。', flags: 64 });
                }
                date.disagree.push(interaction.user.id);
            }

            const agreeCount = date.agree.length;
            const disagreeCount = date.disagree.length;
            const total = agreeCount + disagreeCount;

            const agreePercentage = total > 0 ? (agreeCount / total) * 100 : 0; // 0除算を回避
            const disagreePercentage = total > 0 ? (disagreeCount / total) * 100 : 0;

            const embed = new EmbedBuilder()
                .setColor(0x0099FF)
                .setTitle(interaction.message.embeds[0].title)
                .setAuthor({ name: interaction.message.embeds[0].author.name })
                .setDescription(interaction.message.embeds[0].description)
                .addFields(
                    { name: '賛成', value: `${agreeCount} - (${agreePercentage.toFixed(2)}%)`, inline: true },
                    { name: '反対', value: `${disagreeCount} - (${disagreePercentage.toFixed(2)}%)`, inline: true },
                )
                .setFooter({ text: '*複垢での投票は禁止です' });

            const buttonA = new ButtonBuilder()
                .setCustomId(`suggestButton_agree`)
                .setLabel("賛成")
                .setStyle(ButtonStyle.Success);
            const buttonB = new ButtonBuilder()
                .setCustomId(`suggestButton_disagree`)
                .setLabel("反対")
                .setStyle(ButtonStyle.Danger);
            const buttonC = new ButtonBuilder()
                .setCustomId(`suggestButton_delete`)
                .setLabel("削除(管理者)")
                .setStyle(ButtonStyle.Secondary);
            const row = new ActionRowBuilder().addComponents(buttonA, buttonB, buttonC);

            interaction.message.edit({ embeds: [embed], components: [row] })
                .then(() => {
                    db.run(`UPDATE suggestion SET agree = ?, disagree = ? WHERE url = ?`,
                        [JSON.stringify(date.agree), JSON.stringify(date.disagree), interaction.message.url],
                    );
                    interaction.reply({ content: '投票が完了しました', ephemeral: true });
                })
        });
    }
};