// events/reloadInfo.js

const { Events, EmbedBuilder } = require('discord.js');
const cron = require('node-cron');

module.exports = {
    name: Events.ClientReady,
    once: true,
    async execute(client) {

        cron.schedule("0 0 * * * *", async () => {
            const MESSAGE_URL_REGEX = /https?:\/\/discord\.com\/channels\/(\d+)\/(\d+)\/(\d+)/g;
            const matches = MESSAGE_URL_REGEX.exec(process.env.INFO_MESSAGE_URL);

            if (matches) {
                const [_, guildId, channelId, messageId] = matches;

                const guild = await client.guilds.fetch(guildId);
                const channel = await client.channels.fetch(channelId);
                const fetchedMessage = await channel.messages.fetch(messageId);

                const role = guild.roles.cache.get("875969584996446260"); // あとでenvに移すかも

                const embed = new EmbedBuilder()
                    .setColor(0x0099FF)
                    .setAuthor({ name: guild.name + " ステータス", iconURL: guild.iconURL() })
                    .setDescription(`メンバー数: ${guild.memberCount}\n<@&875969584996446260>: ${role.members.size}\nメッセージ/時: ${/*avg.toFixed(2)*/ "-"} msg/h\n-# ⌞直近30日のメッセージ数/30*24`)
                    .setFooter({ text: `最終更新: ${new Date()}` });

                await fetchedMessage.edit({ content: "", embeds: [embed], components: [] });
            }
        });
    },
};