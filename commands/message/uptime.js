// commands/message/uptime.js

module.exports = {
    name: 'upime',
    description: 'ボットが起動した時刻と稼働時間を表示します',
    async execute(client, message) {
        if (!client.readyAt) return;

        // --- 起動時刻の整形 ---
        const startupTime = client.readyAt;
        const formattedStartupTime = startupTime.toLocaleString('ja-JP', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            timeZoneName: 'shortOffset'
        });

        // --- 稼働時間の計算 ---
        const now = new Date();
        const uptimeMilliseconds = now.getTime() - startupTime.getTime();

        const seconds = Math.floor(uptimeMilliseconds / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        const remainingHours = hours % 24;
        const remainingMinutes = minutes % 60;
        const remainingSeconds = seconds % 60;

        let uptimeString = '';
        if (days > 0) {
            uptimeString += `${days}日`;
        }
        if (remainingHours > 0) {
            uptimeString += `${remainingHours}時間`;
        }
        if (remainingMinutes > 0) {
            uptimeString += `${remainingMinutes}分`;
        }
        if (remainingSeconds > 0) {
            uptimeString += `${remainingSeconds}秒`;
        }

        if (uptimeString === '') {
            uptimeString = '1秒未満';
        }

        await message.reply({
            content: `${formattedStartupTime} に起動しました\n稼働時間: ${uptimeString} (<t:${seconds}:R>)`,
            allowedMentions: { parse: [] }
        });
    },
};