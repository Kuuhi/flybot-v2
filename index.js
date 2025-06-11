const { Client, GatewayIntentBits, Partials, EmbedBuilder, Collection, Events } = require('discord.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildBans,
        GatewayIntentBits.GuildEmojisAndStickers,
        GatewayIntentBits.GuildIntegrations,
        GatewayIntentBits.GuildWebhooks,
        GatewayIntentBits.GuildInvites,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildPresences,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.GuildMessageTyping,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.DirectMessageReactions,
        GatewayIntentBits.DirectMessageTyping,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildScheduledEvents,
    ],
    partials: [
        Partials.User,
        Partials.Channel,
        Partials.GuildMember,
        Partials.Message,
        Partials.Reaction,
        Partials.GuildScheduledEvent,
        Partials.ThreadMember,
    ],
});

require('dotenv').config();

const fs = require('node:fs');
const path = require('node:path');

// --- イベントの読み込みと登録 ---
const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
    const filePath = path.join(eventsPath, file);
    const event = require(filePath);

    if (event.once) {
        client.once(event.name, (...args) => event.execute(...args, client));
    } else {
        client.on(event.name, (...args) => event.execute(...args, client));
    }
}

client.prefixCommands = new Collection();

const messageCommandsPath = path.join(__dirname, 'commands', 'message');
const commandFiles = fs.readdirSync(messageCommandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const filePath = path.join(messageCommandsPath, file);
    const command = require(filePath);

    if ('name' in command && 'execute' in command) {
        client.prefixCommands.set(command.name, command);
        if (command.aliases && Array.isArray(command.aliases)) {
            for (const alias of command.aliases) {
                client.prefixCommands.set(alias, command);
            }
        }
    } else {
        console.warn(`[WARNING] The command at ${filePath} is missing a required "name" or "execute" property.`);
    }
}

const prefix = process.env.PREFIX || '!';

client.on(Events.MessageCreate, async (message) => {
    // プレフィックスコマンドの処理
    if (!message.author.bot && message.content.startsWith(prefix)) {
        const args = message.content.slice(prefix.length).trim().split(/ +/);
        const commandName = args.shift().toLowerCase();
        const command = client.prefixCommands.get(commandName);

        if (!command) {
            return message.reply({ content: "そのコマンドは見つかりませんでした！", allowedMentions: { repliedUser: false } });
        }

        // 管理者専用コマンドの権限チェック
        if (command.adminOnly) {
            const requiredRoleId = process.env.ADMIN_ROLE_ID;

            // ユーザーが指定されたロールを持っているか確認
            if (!message.member.roles.cache.has(requiredRoleId)) {
                return message.reply({ content: "あなたの権限は不足しています", allowedMentions: { repliedUser: false } });
            }
        }

        try {
            await command.execute(client, message, args);
        } catch (error) {
            console.error(error);

            if (message.author.id === "777466773955936266") {
                const embed = new EmbedBuilder()
                    .setColor(0x0099FF)
                    .setDescription(`\`\`\`\n${error.message || error}\n\`\`\``)
                return message.reply({ content: "えらった！", embeds: [embed], allowedMentions: { repliedUser: false } });
            }
            await message.reply({ content: "えらった！", allowedMentions: { repliedUser: false } });
        }
    }
});

client.login(process.env.BOT_TOKEN);