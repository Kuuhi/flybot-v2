// commands/message/unixtime.js

module.exports = {
    name: 'unixtime',
    aliases: ['unix', 'getunix', 'unixTime'],
    description: '',
    usage: 'unixtime [date]',

    async execute(client, message, args) {

        const date = args[0] ? new Date(args[0]) : new Date()
        const unix = Math.floor(date.getTime() / 1000)

        message.reply({ content: String(unix), allowedMentions: { parse: [] } })
    },
};