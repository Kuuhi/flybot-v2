// commands/interaction/button/wiki.js

const { EmbedBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputStyle, TextInputBuilder, ActionRowBuilder } = require('discord.js');
const Database = require("better-sqlite3");
const db = new Database("./database.db");

module.exports = {
    customId: 'wiki',
    description: 'wiki!',

    async execute(client, interaction, args) {

        if (args[0] === "create") {

            const modal = new ModalBuilder()
                .setCustomId(`wiki_post`)
                .setTitle("新規ページ作成");
            const title = new TextInputBuilder()
                .setCustomId("title")
                .setLabel("タイトル")
                .setStyle(TextInputStyle.Short)
                .setRequired(true);
            const content = new TextInputBuilder()
                .setCustomId("content")
                .setLabel("内容")
                .setStyle(TextInputStyle.Paragraph)
                .setRequired(true);
            const imageURL = new TextInputBuilder()
                .setCustomId("imageURL")
                .setLabel("画像URL (任意)")
                .setStyle(TextInputStyle.Short)
                .setRequired(false);
            const tags = new TextInputBuilder()
                .setCustomId("tags")
                .setLabel('タグ (","で区切る)')
                .setStyle(TextInputStyle.Short)
                .setRequired(false);

            const firstActionRow = new ActionRowBuilder().addComponents(title);
            const secondActionRow = new ActionRowBuilder().addComponents(content);
            const thirdActionRow = new ActionRowBuilder().addComponents(imageURL);
            const fourthActionRow = new ActionRowBuilder().addComponents(tags);

            modal.addComponents(firstActionRow, secondActionRow, thirdActionRow, fourthActionRow);

            return await interaction.showModal(modal);
        } else if (args[0] === "search") {

            const modal = new ModalBuilder()
                .setCustomId(`wiki_search`)
                .setTitle("ページ検索");
            const title = new TextInputBuilder()
                .setCustomId("keyword")
                .setLabel("キーワード")
                .setStyle(TextInputStyle.Short)
                .setRequired(true);

            const firstActionRow = new ActionRowBuilder().addComponents(title);
            modal.addComponents(firstActionRow);

            return await interaction.showModal(modal);

        } else if (args[0] === "random") {
            const data = db.prepare('SELECT * FROM wiki').all();
            const filtered = data.filter((wiki) => !!wiki.isTip && !!!wiki.closed);
            if (filtered.length === 0) return await interaction.reply({ content: "表示できるページがありません。", ephemeral: true });
            const random = filtered[Math.floor(Math.random() * filtered.length)];

            const embed = new EmbedBuilder()
                .setColor(0x0099FF)
                .setTitle(random.title)
                .setDescription(random.content)
                .setImage(random.imageURL || null)

            if (JSON.parse(random.tags).length > 0) {
                embed.setFooter({ text: JSON.parse(random.tags).join("|") });
            }

            const button = new ButtonBuilder()
                .setLabel('Ⲷ')
                .setCustomId(`wiki_advance_${random.uuid}`)
                .setStyle(ButtonStyle.Success);
            const row = new ActionRowBuilder().addComponents(button);

            return await interaction.reply({ embeds: [embed], components: [row] });
        } else if (args[0] === "advance") {
            const uuid = args[1]?.trim();
            const page = db.prepare('SELECT * FROM wiki WHERE uuid = ?').get(uuid);
            if (!page) return await interaction.reply({ content: "ページが見つかりませんでした。", ephemeral: true });

            const embed = new EmbedBuilder()
                .setColor(0x0099FF)
                .setTitle(page.title)
                .setDescription(`編集者: <@${page.authorId}>\n最終更新: <t:${Math.floor(new Date(page.updatedAt).getTime() / 1000)}:f>\nuuid: ${page.uuid}`);

            const editButton = new ButtonBuilder()
                .setLabel('編集')
                .setCustomId(`wiki_edit_${page.uuid}`)
                .setStyle(ButtonStyle.Primary);
            const cloneButton = new ButtonBuilder()
                .setLabel('複製して新規作成')
                .setCustomId(`wiki_clone_${page.uuid}`)
                .setStyle(ButtonStyle.Secondary);
            const reportButton = new ButtonBuilder()
                .setLabel('報告')
                .setCustomId(`wiki_report_${page.uuid}`)
                .setStyle(ButtonStyle.Danger);
            const row = new ActionRowBuilder().addComponents(editButton, cloneButton, reportButton);

            return await interaction.update({ embeds: [interaction.message.embeds[0], embed], components: [row] });
        } else if (args[0] === "edit") {
            const uuid = args[1]?.trim();
            const page = db.prepare('SELECT * FROM wiki WHERE uuid = ?').get(uuid);
            if (!page) return await interaction.reply({ content: "ページが見つかりませんでした。", ephemeral: true });

            const modal = new ModalBuilder()
                .setCustomId(`wiki_edit_${page.uuid}`)
                .setTitle("ページ編集")
            const title = new TextInputBuilder()
                .setCustomId("title")
                .setLabel("タイトル")
                .setStyle(TextInputStyle.Short)
                .setRequired(true)
                .setValue(page.title);
            const content = new TextInputBuilder()
                .setCustomId("content")
                .setLabel("内容")
                .setStyle(TextInputStyle.Paragraph)
                .setRequired(true)
                .setValue(page.content);
            const imageURL = new TextInputBuilder()
                .setCustomId("imageURL")
                .setLabel("画像URL (任意)")
                .setStyle(TextInputStyle.Short)
                .setRequired(false)
                .setValue(page.imageURL || "");
            const tags = new TextInputBuilder()
                .setCustomId("tags")
                .setLabel('タグ (","で区切る)')
                .setStyle(TextInputStyle.Short)
                .setRequired(false)
                .setValue(page.tags ? JSON.parse(page.tags).join(",") : "");
            const firstActionRow = new ActionRowBuilder().addComponents(title);
            const secondActionRow = new ActionRowBuilder().addComponents(content);
            const thirdActionRow = new ActionRowBuilder().addComponents(imageURL);
            const fourthActionRow = new ActionRowBuilder().addComponents(tags);
            modal.addComponents(firstActionRow, secondActionRow, thirdActionRow, fourthActionRow);
            return await interaction.showModal(modal);
        } else if (args[0] === "clone") {
            const uuid = args[1]?.trim();
            const page = db.prepare('SELECT * FROM wiki WHERE uuid = ?').get(uuid);
            if (!page) return await interaction.reply({ content: "ページが見つかりませんでした。", ephemeral: true });

            const modal = new ModalBuilder()
                .setCustomId(`wiki_clone_${page.uuid}`)
                .setTitle("ページ複製して新規作成")
            const title = new TextInputBuilder()
                .setCustomId("title")
                .setLabel("タイトル")
                .setStyle(TextInputStyle.Short)
                .setRequired(true)
                .setValue(page.title);
            const content = new TextInputBuilder()
                .setCustomId("content")
                .setLabel("内容")
                .setStyle(TextInputStyle.Paragraph)
                .setRequired(true)
                .setValue(page.content);
            const imageURL = new TextInputBuilder()
                .setCustomId("imageURL")
                .setLabel("画像URL (任意)")
                .setStyle(TextInputStyle.Short)
                .setRequired(false)
                .setValue(page.imageURL || "");
            const tags = new TextInputBuilder()
                .setCustomId("tags")
                .setLabel('タグ (","で区切る)')
                .setStyle(TextInputStyle.Short)
                .setRequired(false)
                .setValue(page.tags ? JSON.parse(page.tags).join(",") : "");
            const firstActionRow = new ActionRowBuilder().addComponents(title);
            const secondActionRow = new ActionRowBuilder().addComponents(content);
            const thirdActionRow = new ActionRowBuilder().addComponents(imageURL);
            const fourthActionRow = new ActionRowBuilder().addComponents(tags);
            modal.addComponents(firstActionRow, secondActionRow, thirdActionRow, fourthActionRow);
            return await interaction.showModal(modal);
        } else if (args[0] === "report") {
            const uuid = args[1]?.trim();
            const page = db.prepare('SELECT * FROM wiki WHERE uuid = ?').get(uuid);
            if (!page) return await interaction.reply({ content: "ページが見つかりませんでした。", ephemeral: true });

            const modal = new ModalBuilder()
                .setCustomId(`wiki_report_${page.uuid}`)
                .setTitle("ページを報告");
            const reason = new TextInputBuilder()
                .setCustomId("reason")
                .setLabel("報告理由")
                .setStyle(TextInputStyle.Paragraph)
                .setRequired(true);

            const firstActionRow = new ActionRowBuilder().addComponents(reason);
            modal.addComponents(firstActionRow);
            return await interaction.showModal(modal);
        } else {
            return await interaction.reply({ content: "不明な操作です。", ephemeral: true });
        }
    }
};