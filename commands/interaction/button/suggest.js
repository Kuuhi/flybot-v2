// commands\interaction\button\suggest.js

const { ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');

module.exports = {
    customId: 'suggest',
    description: '',

    async execute(interaction) {
        const modal = new ModalBuilder()
            .setCustomId('sendSuggest')
            .setTitle('提案');
        const titleInput = new TextInputBuilder()
            .setCustomId('titleInput')
            .setLabel("タイトル(書ければ簡単に)")
            .setStyle(TextInputStyle.Short)
            .setRequired(false);
        const textInput = new TextInputBuilder()
            .setCustomId('textInput')
            .setLabel("提案内容")
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(true);
        const titleInputActionRow = new ActionRowBuilder().addComponents(titleInput);
        const textActionRow = new ActionRowBuilder().addComponents(textInput);
        modal.addComponents(titleInputActionRow, textActionRow);

        await interaction.showModal(modal);
    }
};