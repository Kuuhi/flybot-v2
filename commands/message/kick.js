// commands/message/kick.js

module.exports = {
    name: 'kick',
    description: '指定したメンバーをkickします。',
    adminOnly: true,
    usage: '<ユーザーIDまたはメンション> [理由]',

    async execute(client, message, args) {

        const targetUser = message.mentions.users.first() || await client.users.fetch(args[0]).catch(() => null);
        if (!targetUser) {
            return message.reply({ content: 'kickするユーザーを指定してください', allowedMentions: { repliedUser: false } });
        }

        const member = message.guild.members.cache.get(targetUser.id);
        if (!member) {
            return message.reply({ content: 'サーバーにそのユーザーはいません', allowedMentions: { repliedUser: false } });
        }

        const reason = args.slice(1).join(' ') || '理由が指定されていません';

        await member.kick({ reason: reason });
        message.channel.send(`${targetUser.tag} をkickしました`);
    },
};