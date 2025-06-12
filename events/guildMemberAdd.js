// events/guildMemberAdd.js

const { ChannelType, EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'guildMemberAdd',
    once: false,
    
    async execute(member, client) {
        const gateChannelId = process.env.GATE_CHANNEL_ID;
        const channel = member.guild.channels.cache.get(gateChannelId);

        if (!gateChannelId) return;
        if (!channel || channel.type !== ChannelType.GuildText) return;

        const embed = new EmbedBuilder()
            .setColor(0x00FF00)
            .setAuthor({ name: "+ 参加", iconURL: member.guild.iconURL() })
            .setDescription(`**${member.user.tag}** がサーバーに参加しました！`)
            .setTimestamp()

        try {
            await channel.send({ embeds: [embed] });
        } catch (error) {
            console.error(error);
        }
    },
};