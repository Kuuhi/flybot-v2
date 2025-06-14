// commands\interaction\modal\sendReport.js

const { EmbedBuilder } = require('discord.js');

module.exports = {
    customId: 'sendReport',
    description: 'reportのmodal処理',

    async execute(interaction) {
        const title = interaction.fields.getTextInputValue('titleInput');
        const text = interaction.fields.getTextInputValue('textInput');
        const user = interaction.user;
        const REPORT_CHANNEL_ID = process.env.REPORT_CHANNEL_ID;
        const reportChannel = await interaction.client.channels.fetch(REPORT_CHANNEL_ID);

        try {
            const reportEmbed = new EmbedBuilder()
                .setColor(0xFFA500)
                .setTitle("レポート")
                .addFields(
                    { name: '送信者', value: `${user.tag} (${user.id})` },
                    { name: '件名', value: `${title || '件名なし'}` },
                    { name: '本文', value: text }
                )

            await reportChannel.send({ embeds: [reportEmbed] });
            await interaction.reply({ content: '送信しました', ephemeral: true });

        } catch (error) {
            console.error(error);
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({ content: 'えらった！', ephemeral: true });
            } else {
                await interaction.reply({ content: 'えらった！', ephemeral: true });
            }
        }
    },
};