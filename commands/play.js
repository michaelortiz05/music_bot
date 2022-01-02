const { SlashCommandBuilder } = require('@discordjs/builders');
const ytdl = require('ytdl-core');
const ytSearch = require('yt-search');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('play')
        .setDescription('Search youtube and stream result')
        .addStringOption(option =>
            option.setName('search')
                .setDescription('The input to echo back')
                .setRequired(true)),
    async execute(interaction) {
        let term = interaction.options.getString('search');
        let member = interaction.member;
        let channel = member.voice.channelId;

        if (channel === null)
            await interaction.reply('Join a channel! Get after it!');
        else {
            const search = await ytSearch (term);
            //console.log(search);//interaction.reply(search);
            const videos = search.videos.slice(0,3);
            console.log(videos);
            let video = {};
            for (let i = 0; i < videos.length; i++) {
                if (videos[i].url != null) {
                    video = videos[i];
                    break;
                }
            }
            if(Object.keys(video).length > 0) {
                await interaction.reply(video.url);
            }
            else
                await interaction.reply('Something went wrong! Stay hungry and try another search!');
        }

    },
};
