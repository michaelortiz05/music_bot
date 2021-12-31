const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('logout')
        .setDescription('Sets the bot offline'),
    async execute(interaction) {
        interaction.reply('The grind never stops!')
        await interaction.client.destroy();
    },
};
