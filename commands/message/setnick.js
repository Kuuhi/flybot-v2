// commands/message/setnick.js

module.exports = {
    name: 'setnick',
    description: '指定したメンバーのニックネームを変更します',
    adminOnly: true,
    usage: 'setnick <ユーザー> [新しいニックネーム]',
    async execute(client, message, args) {
        const targetUser = message.mentions.users.first() || await client.users.fetch(args[0]).catch(() => null);
        if (!targetUser) {
            return message.reply({ content: 'ユーザーが指定されていません', allowedMentions: { repliedUser: false } });
        }

        const member = message.guild.members.cache.get(targetUser.id);
        if (!member) {
            return message.reply({ content: 'ユーザーが見つかりません', allowedMentions: { repliedUser: false } });
        }

        try {
            await member.setNickname(args[1] ? args[1] : null, args[2]);
        } catch (error) {
            console.error(error);
            message.reply({ content: "えらった！", allowedMentions: { repliedUser: false } });
        }
    },
};