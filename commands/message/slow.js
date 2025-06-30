module.exports = {
    name: 'slow',
    aliases: ['sl'],
    description: '指定されたチャンネル、または現在のチャンネルに低速モードを設定します。',
    adminOnly: true,
    usage: '[チャンネルIDまたはメンション] <期間>',

    async execute(client, message, args) {

        // チャンネル指定があるかチェック
        const firstArgIsChannel = message.mentions.channels.first() || await client.channels.fetch(args[0]).catch(() => null)

        if (firstArgIsChannel && firstArgIsChannel.type === 0) { // GUILD_TEXT
            targetChannel = firstArgIsChannel;
            durationString = args[1];
        } else {
            targetChannel = message.channel;
            durationString = args[0];
        }

        if (!durationString) {
            return message.reply({ content: '低速モードの期間を指定してください。(例: 10s, 5m, 1h)', allowedMentions: { repliedUser: false } });
        }

        function parseDuration(durationString) {
            const match = durationString.match(/^(\d+)([smhdwMy])?$/); // 単位がない場合は秒とみなす

            if (!match) return null;

            const value = parseInt(match[1], 10);
            const unit = match[2];

            if (!unit) return value; // 単位がない場合は秒

            switch (unit) {
                case 's': return value;
                case 'm': return value * 60;
                case 'h': return value * 60 * 60;
                case 'd': return value * 60 * 60 * 24;
                case 'w': return value * 60 * 60 * 24 * 7;
                case 'M': return value * 60 * 60 * 24 * 30; // 便宜上30日とする
                case 'y': return value * 60 * 60 * 24 * 365;
                default: return null;
            }
        }

        const durationSeconds = parseDuration(durationString);

        if (durationSeconds === null || isNaN(durationSeconds) || durationSeconds < 0 || durationSeconds > 21600) { // Discordの低速モードは最大6時間 (21600秒)
            return message.reply({ content: '低速モードの期間は0秒から6時間（21600秒）の間で指定してください。例: `10s`, `5m`, `1h`', allowedMentions: { repliedUser: false } });
        }

            await targetChannel.setRateLimitPerUser(durationSeconds);
            if (durationSeconds === 0) {
                message.channel.send(`${targetChannel.name} の低速モードを解除しました。`);
            } else {
                message.channel.send(`${targetChannel.name} に ${durationSeconds} 秒の低速モードを設定しました。`);
            }

    },
};
