// commands\interaction\button\report.js

const { ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');

module.exports = {
    customId: 'report',
    description: 'BOT管理者とFLY鯖管理者にreportを送信するモーダルを表示します。',

    async execute(interaction) {
        const modal = new ModalBuilder()
            .setCustomId('sendReport')
            .setTitle('レポート');
        const titleInput = new TextInputBuilder()
            .setCustomId('titleInput')
            .setLabel("件名")
            .setStyle(TextInputStyle.Short);
        const textInput = new TextInputBuilder()
            .setCustomId('textInput')
            .setLabel("本文")
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(true);
        const titleInputActionRow = new ActionRowBuilder().addComponents(titleInput);
        const textActionRow = new ActionRowBuilder().addComponents(textInput);
        modal.addComponents(titleInputActionRow, textActionRow);

        try {
            await interaction.showModal(modal);
        } catch (error) {
            console.error(error);
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({ content: 'えらった！', ephemeral: true });
            } else {
                await interaction.reply({ content: 'えらった！', ephemeral: true });
            }
        }
    },
};