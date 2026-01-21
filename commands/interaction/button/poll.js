// commands/interaction/button/poll.js
const { ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');

module.exports = {
    customId: 'poll',
    description: 'アンケート作成モーダルを表示',

    async execute(client, interaction) {
        const modal = new ModalBuilder()
            .setCustomId('sendPoll')
            .setTitle('アンケート作成');

        const questionInput = new TextInputBuilder()
            .setCustomId('questionInput')
            .setLabel("問い (必須)")
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(true);

        const opt1 = new TextInputBuilder()
            .setCustomId('opt1')
            .setLabel("選択肢1 (必須)")
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

        const opt2 = new TextInputBuilder()
            .setCustomId('opt2')
            .setLabel("選択肢2 (必須)")
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

        const opt3 = new TextInputBuilder()
            .setCustomId('opt3')
            .setLabel("選択肢3 (任意)")
            .setStyle(TextInputStyle.Short)
            .setRequired(false);

        const opt4 = new TextInputBuilder()
            .setCustomId('opt4')
            .setLabel("選択肢4 (任意)")
            .setStyle(TextInputStyle.Short)
            .setRequired(false);

        modal.addComponents(
            new ActionRowBuilder().addComponents(questionInput),
            new ActionRowBuilder().addComponents(opt1),
            new ActionRowBuilder().addComponents(opt2),
            new ActionRowBuilder().addComponents(opt3),
            new ActionRowBuilder().addComponents(opt4)
        );

        await interaction.showModal(modal);
    }
};