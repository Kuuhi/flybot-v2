// events/messageDeleteMute.js

const { Events } = require('discord.js');

module.exports = {
    name: Events.MessageCreate,
    
    execute(message) {
        if (message.member?.roles?.cache.has("898931354769707078")) {
            message.delete().catch(error => console.error(error));
        }
    },
};