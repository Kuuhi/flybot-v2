// commands/interaction/selectmenu/wiki.js

const { EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');
const Database = require("better-sqlite3");
const { arg, all } = require('mathjs');
const db = new Database("./database.db");

module.exports = {
    customId: 'wiki',
    description: 'wiki!',

    async execute(client, interaction, args) {

        if (args[0] === "select" || args[0] === "branch") {
            const uuid = interaction.values[0];
            const wiki = db.prepare('SELECT * FROM wiki WHERE uuid = ?').get(uuid);
            if (!wiki) return await interaction.reply({ content: "該当するページが見つかりませんでした。", ephemeral: true });

            // tagsがnullや空の場合は空配列にする
            let tags = [];
            if (wiki.tags) {
                try {
                    tags = JSON.parse(wiki.tags);
                } catch (e) {
                    tags = [];
                }
            }

            const embed = new EmbedBuilder()
                .setColor(0x0099FF)
                .setTitle(wiki.title)
                .setDescription(wiki.content)
                .setImage(wiki.imageURL || null);
            if (tags.length > 0) {
                embed.setFooter({ text: tags.join("|") });
            }

            const actionButtons = [];
            actionButtons.push(new ButtonBuilder().setLabel('Ⲷ').setCustomId(`wiki_advance_${wiki.uuid}`).setStyle(ButtonStyle.Success));
            actionButtons.push(new ButtonBuilder().setLabel('編集').setCustomId(`wiki_edit_${wiki.uuid}`).setStyle(ButtonStyle.Primary));
            actionButtons.push(new ButtonBuilder().setLabel('複製して新規作成').setCustomId(`wiki_clone_${wiki.uuid}`).setStyle(ButtonStyle.Secondary));
            actionButtons.push(new ButtonBuilder().setLabel('報告').setCustomId(`wiki_report_${wiki.uuid}`).setStyle(ButtonStyle.Danger));

            const row = new ActionRowBuilder().addComponents(actionButtons);
            return await interaction.update({ embeds: [embed], components: [row] });
        }
    }
};