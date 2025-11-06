// commands/message/wiki.js

const { EmbedBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder, ActionRowBuilder } = require('discord.js');
const Database = require("better-sqlite3");
const db = new Database("./database.db");
const Fuse = require('fuse.js');
const { all } = require('mathjs');

module.exports = {
    name: 'wiki',
    description: 'wiki!',

    async execute(client, message) {

        const cmd = message.content.split(" ");

        if (!cmd[1]) {

            const data = db.prepare('SELECT * FROM wiki').all();
            const filtered = data.filter((wiki) => !!wiki.isTip && !!!wiki.closed);
            const count = filtered.length;

            const embed = new EmbedBuilder()
                .setColor(0x0099FF)
                .setDescription(`
                    準備中

                    現在: ${count}件のページがあります。
                    `);

            const search = new ButtonBuilder()
                .setCustomId('wiki_search')
                .setLabel('ページを検索')
                .setStyle(ButtonStyle.Primary);
            const create = new ButtonBuilder()
                .setCustomId('wiki_create')
                .setLabel('ページを作成')
                .setStyle(ButtonStyle.Success);
            const random = new ButtonBuilder()
                .setCustomId('wiki_random')
                .setLabel('ランダム表示')
                .setStyle(ButtonStyle.Secondary);
            const row = new ActionRowBuilder().addComponents(search, create, random);

            return await message.reply({ embeds: [embed], components: [row], allowedMentions: { repliedUser: false } });

        } else if (cmd[1] === "create") {

            const button = new ButtonBuilder()
                .setCustomId('wiki_create')
                .setLabel('ページを作成')
                .setStyle(ButtonStyle.Primary);

            const row = new ActionRowBuilder().addComponents(button);

            return await message.channel.send({ components: [row] });
        } else if (cmd[1] === "search") {

            const keyword = cmd.slice(2).join(" ");
            if (!keyword) return message.reply("キーワードを指定してください。");

            const data = db.prepare('SELECT * FROM wiki').all();

            const fuse = new Fuse(data, { keys: ['title', 'tags'] });
            const result = fuse.search(keyword).map(res => res.item);

            if (result.length === 0) return message.reply({ content: "該当するページが見つかりませんでした。", allowedMentions: { repliedUser: false } });

            // 25件を超える場合は先頭25件のみ
            const limitedResult = result.slice(0, 25);

            const select = new StringSelectMenuBuilder()
                .setCustomId('wiki_search')
                .setPlaceholder(`${limitedResult.length}件がヒット！`)
                .addOptions(
                    limitedResult.map((wiki, index) => {
                        return {
                            label: wiki.title.slice(0, 25) || "No Title",
                            description: wiki.title.slice(0, 50) || "",
                            value: String(index)
                        };
                    })
                );
            const row = new ActionRowBuilder().addComponents(select);

            return await message.channel.send({ components: [row] });
        }
    },
};