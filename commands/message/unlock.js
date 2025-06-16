// commands/message/unlock.js

module.exports = {
    name: 'unlock',
    adminOnly: true,
    description: '',

    async execute(client, message) {
        if (message.channel.isThread()) {
            await message.channel.setLocked(false);
            await message.react("✅")
        }
    },
};