// events/guildMemberRemove.js

const { ChannelType, EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'guildMemberRemove',
    once: false,

    async execute(member, client) {
        const gateChannelId = process.env.GATE_CHANNEL_ID;
        const channel = member.guild.channels.cache.get(gateChannelId);

        if (!gateChannelId) return;
        if (!channel || channel.type !== ChannelType.GuildText) return;

        const embed = new EmbedBuilder()
            .setColor(0xFF0000)
            .setAuthor({ name: "- 脱退", iconURL: member.guild.iconURL() })
            .setDescription(`**${member.user.tag}** がサーバーを退出しました。`)
            .setTimestamp()

        try {
            await channel.send({ embeds: [embed] });
        } catch (error) {
            console.error(error);
        }
    },
};