// commands\interaction\button\errorNotice.js

const { EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    customId: 'errorNotice',
    description: '',
    adminOnly: true,

    async execute(interaction, args) {

        if (args[0] === "delete") {
            interaction.message.delete();
        }

        if (args[0] === "hold") {
            const exampleEmbed = new EmbedBuilder()
                .setColor(0x00FF00)
                .setTitle(`エラー通知(保留中)`)
                .setDescription(interaction.message.embeds[0].description)
            const buttonA = new ButtonBuilder()
                .setCustomId(`errorNotice_delete`)
                .setLabel("削除")
                .setStyle(ButtonStyle.Danger);
            const buttonB = new ButtonBuilder()
                .setCustomId(`errorNotice_hold`)
                .setLabel("保留")
                .setStyle(ButtonStyle.Secondary)
                .setDisabled(true);
            const buttonC = new ButtonBuilder()
                .setCustomId(`errorNotice_resolution`)
                .setLabel("解決")
                .setStyle(ButtonStyle.Success);
            const row = new ActionRowBuilder().addComponents(
                buttonA,
                buttonB,
                buttonC
            );
            interaction.message.edit({
                embeds: [exampleEmbed],
                components: [row],
            });
            interaction.deferUpdate();
        }

        if (args[0] === "resolution") {
            const exampleEmbed = new EmbedBuilder()
                .setColor(0x00FF00)
                .setTitle(`エラー通知(解決済み)`)
                .setDescription(interaction.message.embeds[0].description)
            const buttonA = new ButtonBuilder()
                .setCustomId(`errorNotice_delete`)
                .setLabel("削除")
                .setStyle(ButtonStyle.Danger);
            const buttonB = new ButtonBuilder()
                .setCustomId(`errorNotice_hold`)
                .setLabel("保留")
                .setStyle(ButtonStyle.Secondary)
                .setDisabled(true);
            const buttonC = new ButtonBuilder()
                .setCustomId(`errorNotice_resolution`)
                .setLabel("解決")
                .setStyle(ButtonStyle.Success)
                .setDisabled(true);
            const row = new ActionRowBuilder().addComponents(
                buttonA,
                buttonB,
                buttonC
            );
            interaction.message.edit({
                embeds: [exampleEmbed],
                components: [row],
            });
            interaction.deferUpdate();
        }
        
    },
};