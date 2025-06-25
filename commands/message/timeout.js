// commands/message/timeout.js

module.exports = {
    name: 'timeout',
    aliases: ['to'],
    description: '',
    adminOnly: true,
    usage: '<ユーザーIDまたはメンション> [期間] [理由]',

    async execute(client, message, args) {

        const targetUser = message.mentions.users.first() || await client.users.fetch(args[0]).catch(() => null);
        const member = message.guild.members.cache.get(targetUser.id);

        if (!targetUser) {
            return message.reply({ content: 'タイムアウトするユーザーを指定してください', allowedMentions: { repliedUser: false } });
        }

        if (!member) {
            return message.reply({ content: 'サーバーにそのユーザーはいません', allowedMentions: { repliedUser: false } });
        }

        function parseDuration(durationString) {
            const match = durationString.match(/^(\d+)([smhdwMy])$/);

            if (!match) return null;

            const value = parseInt(match[1], 10);
            const unit = match[2];

            switch (unit) {
                case 's': return value;
                case 'm': return value * 60;                 // 分 > 秒 * 60
                case 'h': return value * 60 * 60;            // 時間 > 秒 * 60 * 60
                case 'd': return value * 60 * 60 * 24;       // 日 > 秒 * 60 * 60 * 24
                case 'w': return value * 60 * 60 * 24 * 7;   // 週 > 秒 * 60 * 60 * 24 * 7
                case 'M': return value * 60 * 60 * 24 * 30;  // 月 > 秒 * 60 * 60 * 24 * 30
                case 'y': return value * 60 * 60 * 24 * 365; // 年 > 秒 * 60 * 60 * 24 * 365
                default: return null;
            }
        }

        if (Number(parseDuration(args[1])) > 28 * 24 * 60 * 60) {
            return message.reply({ content: 'タイムアウト期間は最大28日間です', allowedMentions: { repliedUser: false } });
        }

        const reason = args.slice(2).join(' ') || '理由が指定されていません';

        await member.timeout(parseDuration(args[1]) * 1000 || parseDuration('7d'), reason);
        message.channel.send(`${targetUser.tag} をタイムアウトしました`);

    },
};