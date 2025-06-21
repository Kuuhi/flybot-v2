// commands/message/ban.js

module.exports = {
    name: 'ban',
    description: '指定したメンバーをBANします。',
    adminOnly: true,
    usage: '<ユーザーIDまたはメンション> [理由]', // 使い方を記述（helpで表示しないが、内部的には役立つらしい）
    async execute(client, message, args) {
        if (!message.member.permissions.has([PermissionsBitField.Flags.BanMembers])) {
            return message.reply({ content: 'このコマンドを実行する権限がありません！', allowedMentions: { repliedUser: false } });
        }

        const targetUser = message.mentions.users.first() || await client.users.fetch(args[0]).catch(() => null);
        if (!targetUser) {
            return message.reply({ content: 'BANするユーザーを指定してください。', allowedMentions: { repliedUser: false } });
        }

        if (member.roles.highest.position >= message.member.roles.highest.position && message.author.id !== message.guild.ownerId) {
            return message.reply({ content: '自分と同等かそれ以上のロールを持つメンバーをBANすることはできません。', allowedMentions: { repliedUser: false } });
        }

        const reason = args.slice(1).join(' ') || '理由が指定されていません。';

            await member.ban({ reason: reason });
            message.channel.send(`${targetUser.tag} をBANしました`);
    },
};