// commands\interaction\modal\sendSuggest.js

const { EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle } = require('discord.js');

const sqlite3 = require("sqlite3");
const db = new sqlite3.Database("./database.db");

module.exports = {
    customId: 'sendSuggest',
    description: 'suggestのmodal処理',

    async execute(interaction) {
        const title = interaction.fields.getTextInputValue('titleInput');
        const text = interaction.fields.getTextInputValue('textInput');

        const channel = await interaction.client.channels.fetch(process.env.SUGGEST_CHANNEL_ID);

        const embed = new EmbedBuilder()
            .setColor(0x0099FF)
            .setTitle(title || 'タイトルなし')
            .setAuthor({ name: '提案' })
            .setDescription(text)
            .addFields(
                { name: '賛成', value: '0 - (-%)', inline: true },
                { name: '反対', value: '0 - (-%)', inline: true },
            )
            .setFooter({ text: '*複垢での投票は禁止です' });

        const buttonA = new ButtonBuilder()
            .setCustomId(`suggestButton_agree`)
            .setLabel("賛成")
            .setStyle(ButtonStyle.Success);
        const buttonB = new ButtonBuilder()
            .setCustomId(`suggestButton_disagree`)
            .setLabel("反対")
            .setStyle(ButtonStyle.Danger);
        const buttonC = new ButtonBuilder()
            .setCustomId(`suggestButton_delete`)
            .setLabel("削除(管理者)")
            .setStyle(ButtonStyle.Secondary);
        const row = new ActionRowBuilder().addComponents(buttonA, buttonB, buttonC);

        const msg = await channel.send({ embeds: [embed], components: [row] });
        db.run(
            `INSERT INTO suggestion(url, isVotingActive, agree, disagree) VALUES (?, ?, ?, ?)`,
            [msg.url, 'true', JSON.stringify([]), JSON.stringify([])]
        );
        await interaction.reply({ content: "提案が作成されました！\n" + msg.url, flags: 64 });

        
        // log
        const logChannel = await interaction.client.channels.fetch(process.env.LOG_CHANNEL_ID);

        if (!logChannel) return

        const logEmbed = new EmbedBuilder()
            .setColor(0x0099FF)
            .setTitle('新しい提案が作成されました')
            .setDescription(`**提案者:** ${interaction.user.tag}\n**タイトル:** ${title || 'タイトルなし'}\n**内容:** ${text}`)
            .setFooter({ text: `${interaction.member ? interaction.member.displayName : interaction.user.username}のリクエスト`, iconURL: interaction.user.displayAvatarURL() });

            await logChannel.send({ embeds: [logEmbed] });
    },
};