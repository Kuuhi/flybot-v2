// commands/message/lock.js

module.exports = {
    name: 'lock',
    adminOnly: true,
    description: 'チャンネルをロックします',

    async execute(client, message) {
        if (message.channel.isThread()) {
            await message.channel.setLocked(true);
            await message.react("✅")
            await message.channel.send({
                content: "このスレッドはロックされました。\nロックを解除したい場合は`unlock`コマンドを使用"
            })
        }
    },
};