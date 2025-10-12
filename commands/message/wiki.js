// commands/message/wiki.js

const { EmbedBuilder } = require('discord.js');
const sqlite3 = require("sqlite3");
const db = new sqlite3.Database("./database.db");

module.exports = {
    name: 'wiki',
    description: 'wiki!',

    async execute(client, message) {

        const cmd = message.content.split(" ");

        if (!cmd[1]) {

            const embed = new EmbedBuilder()
                .setColor(0x0099FF)
                .setDescription(`準備中`)

            return message.channel.send({ embeds: [embed] });
        }


    },
};