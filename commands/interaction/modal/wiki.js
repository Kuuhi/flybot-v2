// commands/interaction/button/wiki.js

const { EmbedBuilder, StringSelectMenuBuilder, ActionRowBuilder } = require('discord.js');
const Database = require("better-sqlite3");
const db = new Database("./database.db");
const crypto = require('crypto');
const Fuse = require('fuse.js');
const { all } = require('mathjs');

module.exports = {
    customId: 'wiki',
    description: 'wiki!',

    async execute(client, interaction, args) {

        if (args[0] === "post") {

            const title = interaction.fields.getTextInputValue("title");
            const content = interaction.fields.getTextInputValue("content");
            const imageURL = interaction.fields.getTextInputValue("imageURL") || null;
            const tagsRaw = interaction.fields.getTextInputValue("tags") || "";
            const tagsArray = tagsRaw ? tagsRaw.split(",") : [];
            const authorId = interaction.user.id;
            const uuid = crypto.randomUUID();
            const createAt = Math.floor(Date.now() / 1000);
            const updatedAt = createAt; // 作成時はcreateAtと同じ値を入れる
            const branch = [];
            const isTip = 1;
            const closed = 0;

            const existing = db.prepare('SELECT * FROM wiki WHERE title = ?').get(title);
            if (existing) return await interaction.reply({ content: "同じタイトルのページがすでに存在します", ephemeral: true });

            // updatedAtもINSERTに含める
            const stmt = db.prepare('INSERT INTO wiki (uuid, title, content, imageURL, tags, authorId, createAt, updatedAt, branch, isTip, closed) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
            stmt.run(uuid, title, content, imageURL, JSON.stringify(tagsArray), authorId, createAt, updatedAt, JSON.stringify(branch), isTip, closed);

            return await interaction.reply({ content: "ページを作成しました！", ephemeral: true });
        } else if (args[0] === "search") {

            const keyword = interaction.fields.getTextInputValue("keyword");
            // isTip=1 かつ closed=0 のページのみ検索対象にする
            const data = db.prepare('SELECT * FROM wiki WHERE (title LIKE ? OR content LIKE ?) AND isTip = 1 AND closed = 0').all(`%${keyword}%`, `%${keyword}%`);
            if (data.length === 0) return await interaction.reply({ content: "該当するページが見つかりませんでした。", ephemeral: true });

            const fuse = new Fuse(data, { keys: ['title', 'tags'] });
            const result = fuse.search(keyword).map(res => res.item);

            if (result.length === 0) return interaction.reply({ content: "該当するページが見つかりませんでした。", ephemeral: true });

            // 25件を超える場合は先頭25件のみ
            const limitedResult = result.slice(0, 25);

            const select = new StringSelectMenuBuilder()
                .setCustomId('wiki_select')
                .setPlaceholder(`${limitedResult.length}件がヒット！`)
                .addOptions(
                    limitedResult.map((wiki) => {
                        return {
                            label: wiki.title.slice(0, 25) || "No Title",
                            description: wiki.title.slice(0, 50) || "",
                            value: wiki.uuid
                        };
                    })
                );
            const row = new ActionRowBuilder().addComponents(select);

            return await interaction.reply({ components: [row], allowedMentions: { repliedUser: false } });
        } else if (args[0] === "edit") {
            const uuid = args[1];
            const page = db.prepare('SELECT * FROM wiki WHERE uuid = ?').get(uuid);
            if (!page) return await interaction.reply({ content: "ページが見つかりませんでした。", ephemeral: true });
            if (page.closed) return await interaction.reply({ content: "このページは編集できません。", ephemeral: true });

            const title = interaction.fields.getTextInputValue("title");
            const content = interaction.fields.getTextInputValue("content");
            const imageURL = interaction.fields.getTextInputValue("imageURL") || null;
            const tagsRaw = interaction.fields.getTextInputValue("tags") || "";
            const tagsArray = tagsRaw ? tagsRaw.split(",") : [];
            const authorId = interaction.user.id;
            const updatedAt = Math.floor(Date.now() / 1000);
            const branch = page.branch ? JSON.parse(page.branch) : [];
            const isTip = 1;
            const closed = 0;

            if (title !== page.title) {
                const existing = db.prepare('SELECT * FROM wiki WHERE title = ?').get(title);
                if (existing) return await interaction.reply({ content: "同じタイトルのページがすでに存在します", ephemeral: true });
            }

            const stmt = db.prepare('INSERT INTO wiki (uuid, title, content, imageURL, tags, authorId, createAt, updatedAt, branch, isTip, closed) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
            stmt.run(crypto.randomUUID(), title, content, imageURL, JSON.stringify(tagsArray), authorId, page.createAt, updatedAt, JSON.stringify([...branch, page.uuid]), isTip, closed);

            // 親ページのisTipを0にする
            db.prepare('UPDATE wiki SET isTip = 0 WHERE uuid = ?').run(page.uuid);

            return await interaction.reply({ content: "ページを編集しました！", ephemeral: true });
        } else if (args[0] === "clone") {
            const uuid = args[1];
            const page = db.prepare('SELECT * FROM wiki WHERE uuid = ?').get(uuid);
            if (!page) return await interaction.reply({ content: "ページが見つかりませんでした。", ephemeral: true });
            if (page.closed) return await interaction.reply({ content: "このページは複製できません。", ephemeral: true });

            const title = interaction.fields.getTextInputValue("title");
            const content = interaction.fields.getTextInputValue("content");
            const imageURL = interaction.fields.getTextInputValue("imageURL") || null;
            const tagsRaw = interaction.fields.getTextInputValue("tags") || "";
            const tagsArray = tagsRaw ? tagsRaw.split(",") : [];
            const authorId = interaction.user.id;
            const updatedAt = Math.floor(Date.now() / 1000);
            const branch = page.branch ? JSON.parse(page.branch) : [];
            const isTip = 1;
            const closed = 0;

            if (title !== page.title) {
                const existing = db.prepare('SELECT * FROM wiki WHERE title = ?').get(title);
                if (existing) return await interaction.reply({ content: "同じタイトルのページがすでに存在します", ephemeral: true });
            }

            const stmt = db.prepare('INSERT INTO wiki (uuid, title, content, imageURL, tags, authorId, createAt, updatedAt, branch, isTip, closed) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
            stmt.run(crypto.randomUUID(), title, content, imageURL, JSON.stringify(tagsArray), authorId, Math.floor(Date.now() / 1000), updatedAt, JSON.stringify([...branch, page.uuid]), isTip, closed);

            return await interaction.reply({ content: "ページを複製して新規作成しました！", ephemeral: true });
        } else if (args[0] === "report") {
            const uuid = args[1];
            const page = db.prepare('SELECT * FROM wiki WHERE uuid = ?').get(uuid);
            if (!page) return await interaction.reply({ content: "ページが見つかりませんでした。", ephemeral: true });

            const reportChannelId = process.env.REPORT_CHANNEL_ID;
            const reportChannel = await client.channels.fetch(reportChannelId);
            if (!reportChannel) return await interaction.reply({ content: "報告チャンネルが見つかりません。", ephemeral: true });

            const reason = interaction.fields.getTextInputValue("reason");

            const embed = new EmbedBuilder()
                .setColor(0xFF0000)
                .setTitle("Wikiページの報告")
                .setDescription(`報告者: <@${interaction.user.id}>\nページタイトル: ${page.title}\nページUUID: ${page.uuid}\n理由: ${reason}`)
                .setTimestamp(); 

            await reportChannel.send({ embeds: [embed] });

            return await interaction.reply({ content: "ページを報告しました。", ephemeral: true });
        }
    }
};