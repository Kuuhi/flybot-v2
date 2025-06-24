// commands\interaction\modal\sendSuggest.js

const { EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle } = require('discord.js');

const sqlite3 = require("sqlite3");
const db = new sqlite3.Database("./database.db");

module.exports = {
    customId: 'sendSuggest',
    description: 'suggestのmodal処理',

    async execute(interaction) {
        const title = interaction.fields.getTextInputValue('titleInput');
        const text = interaction.fields.getTextInputValue('textInput');

        const SUGGEST_CHANNEL_ID = "1005345281082134538";
        const channel = await interaction.client.channels.fetch(SUGGEST_CHANNEL_ID);

        const embed = new EmbedBuilder()
            .setColor(0x0099FF)
            .setTitle(title || 'タイトルなし')
            .setAuthor({ name: '提案' })
            .setDescription(text)
            .addFields(
                { name: '賛成', value: '0 - (-%)', inline: true },
                { name: '反対', value: '0 - (-%)', inline: true },
            )

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

        const msg = await channel.send({ embeds: [embed], components: [row] });
        db.run(
            `INSERT INTO suggestion(url, isVotingActive, agree, disagree) VALUES (?, ?, ?, ?)`,
            [msg.url, 'true', JSON.stringify([]), JSON.stringify([])]
        );
        await interaction.reply({ content: '送信しました', flags: 64 });

    },
};