// commands/message/unixtime.js

module.exports = {
    name: 'unixtime',
    aliases: ['unix','getunix'],
    description: '',
    usage: 'unixtime [date]',
    async execute(client, message, args) {

        const date = args[0] ? new Date(args[0]) : new Date()
        const unix = Math.floor(date.getTime() / 1000)

        try {
            message.reply({ content: String(unix), allowedMentions: { parse: [] } })
        } catch (error) {
            console.error(error);
            message.reply({ content: "えらった！", allowedMentions: { repliedUser: false } });
        }
    },
};