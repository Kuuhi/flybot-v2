// commands/interaction/modal/sendPoll.js
const { EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle } = require('discord.js');
const sqlite3 = require("sqlite3");
const db = new sqlite3.Database("./database.db");

module.exports = {
    customId: 'sendPoll',
    description: 'アンケートの送信・保存',

    async execute(client, interaction, args) {

        const question = interaction.fields.getTextInputValue('questionInput');
        const rawOptions = [
            interaction.fields.getTextInputValue('opt1'),
            interaction.fields.getTextInputValue('opt2'),
            interaction.fields.getTextInputValue('opt3'),
            interaction.fields.getTextInputValue('opt4'),
        ].filter(opt => opt);

        const channel = await interaction.client.channels.fetch(process.env.SUGGEST_CHANNEL_ID);

        const embed = new EmbedBuilder()
            .setColor(0x00FF99)
            .setTitle('アンケート')
            .setDescription(`**${question}**`)

        const row = new ActionRowBuilder();
        rawOptions.forEach((opt, index) => {
            embed.addFields({ name: opt, value: `0票 (0%)`, inline: true });
            row.addComponents(
                new ButtonBuilder()
                    .setCustomId(`pollButton_${index}`)
                    .setLabel(opt)
                    .setStyle(ButtonStyle.Primary)
            );
        });

        // 管理者用削除ボタン
        const adminRow = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId(`pollButton_delete`)
                .setLabel("削除(管理者)")
                .setStyle(ButtonStyle.Secondary)
        );
        
        // 管理者用終了ボタン
        adminRow.addComponents(
            new ButtonBuilder()
                .setCustomId(`pollButton_end`)
                .setLabel("終了(管理者)")
                .setStyle(ButtonStyle.Danger)
        );

        const msg = await channel.send({ embeds: [embed], components: [row, adminRow] });

        db.run(
            `INSERT INTO polls(url, question, options, votes, isVotingActive) VALUES (?, ?, ?, ?, ?)`,
            [msg.url, question, JSON.stringify(rawOptions), JSON.stringify({}), 'true']
        );

        await interaction.reply({ content: "アンケートを公開しました！\n" + msg.url, flags: 64 });

        // ログ
        const logChannel = await interaction.client.channels.fetch(process.env.LOG_CHANNEL_ID);
        if (logChannel) {
            const logEmbed = new EmbedBuilder()
                .setColor(0x00FF99)
                .setTitle('新規アンケート作成')
                .setDescription(`作成者: <@${interaction.user.id}>\n内容: ${question}\n選択肢: ${rawOptions.join(', ')}`)
                .setTimestamp();
            await logChannel.send({ embeds: [logEmbed] });
        }
    },
};