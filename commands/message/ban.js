// commands/message/ban.js

const { PermissionsBitField } = require('discord.js');

module.exports = {
    name: 'ban',
    description: '指定したメンバーをBANします。',
    adminOnly: true,
    usage: '<ユーザーIDまたはメンション> [理由]',
    
    async execute(client, message, args) {
        // 権限チェック
        if (!message.member.permissions.has(PermissionsBitField.Flags.BanMembers)) {
            return message.reply({ 
                content: 'このコマンドを実行する権限がありません！', 
                allowedMentions: { repliedUser: false } 
            });
        }

        if (!args[0]) {
            return message.reply({ 
                content: 'BANするユーザーを指定してください。', 
                allowedMentions: { repliedUser: false } 
            });
        }

        // ユーザー取得
        const targetUser = message.mentions.users.first() || await client.users.fetch(args[0]).catch(() => null);
        if (!targetUser) {
            return message.reply({ 
                content: '指定されたユーザーが見つかりませんでした。', 
                allowedMentions: { repliedUser: false } 
            });
        }

        // GuildMemberを取得
        const targetMember = message.guild.members.cache.get(targetUser.id) || 
            await message.guild.members.fetch(targetUser.id).catch(() => null);

        const reason = args.slice(1).join(' ') || '理由が指定されていません。';

        try {
            
            await message.guild.members.ban(targetUser.id, { reason });
            return message.reply({ 
                content: `${targetUser.tag} をBANしました。\n理由: ${reason}`, 
                allowedMentions: { repliedUser: false } 
            });
            
        } catch (error) {
            console.error('BAN実行エラー:', error);
            return message.reply({ 
                content: 'BANの実行中にエラーが発生しました。', 
                allowedMentions: { repliedUser: false } 
            });
        }
    },
};