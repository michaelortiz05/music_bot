const { SlashCommandBuilder } = require('@discordjs/builders');
const ytdl = require('ytdl-core');
const fs = require('fs');
const { createReadStream } = require('fs');
const ytSearch = require('yt-search');
const { join } = require('path');
const { joinVoiceChannel, createAudioResource, StreamType, VoiceConnectionStatus, generateDependencyReport, entersState} = require('@discordjs/voice');
const { createAudioPlayer, NoSubscriberBehavior } = require('@discordjs/voice');
const { AudioPlayerStatus } = require('@discordjs/voice');
module.exports = {
    data: new SlashCommandBuilder()
        .setName('play')
        .setDescription('Search youtube and stream result')
        .addStringOption(option =>
            option.setName('search')
                .setDescription('The input to echo back')
                .setRequired(true)),
    async execute(interaction) {
    //    console.log(generateDependencyReport());
        let term = interaction.options.getString('search');
        let member = interaction.member;
        let channel = member.voice.channelId;
        const serverQueue = playlist.get(interaction.guild.id);
        if (channel === null)
            await interaction.reply('Join a channel! Get after it!');
        else {
            const search = await ytSearch (term);
            //console.log(search);//interaction.reply(search);
            const videos = search.videos.slice(0,3);

            let video = {};
            for (let i = 0; i < videos.length; i++) {
                if (videos[i].url != null) {
                    video = videos[i];
                    break;
                }
            }
            if(Object.keys(video).length > 0) {
                const song = {
                    title: video.title,
                    url: video.url
                };
                if (!serverQueue) {
                 //   console.log('Test');
                    const queueContruct = {
                        textChannel: interaction.channel,
                        voiceChannel: member.voice.channel,
                        connection: null,
                        songs: [],
                        volume: 5,
                        playing: true,
                    };
                    playlist.set(interaction.guild.id, queueContruct);
                    queueContruct.songs.push(song);
                   // console.log(queueContruct.songs);
                    try {
                        const connection =  joinVoiceChannel({
                            channelId: member.voice.channelId,
                            guildId: interaction.guildId,
                            adapterCreator: queueContruct.voiceChannel.guild.voiceAdapterCreator,
                        }); // RESUME FROM HERE
                      //  console.log(connection);
                        queueContruct.connection = connection;
                        await play(interaction.guild, queueContruct.songs[0]);
                        // connection.on(VoiceConnectionStatus.Ready, () => {
                        //     console.log('The connection has entered the Ready state - ready to play audio!');
                        //     play(interaction.guild, queueContruct.songs[0], interaction);
                        // });
                       // console.log('queue: ' + '\n' + queueContruct.songs[0]);

                    } catch (err) {
                        console.log(err);
                        playlist.delete(interaction.guild.id);
                        await interaction.reply('Something went wrong! Stay hungry and try another search!');
                    }
                }
                else {
                    serverQueue.songs.push(song);
                    console.log(serverQueue.songs);
                    await interaction.reply(song.url);
                    await interaction.followUp('Added to queue.');
                }

            }
            else
                await interaction.reply('Something went wrong! Stay hungry and try another search!');
        }

    },
};

async function play(guild, song){
    const serverQueue = playlist.get(guild.id);
    //console.log('Printing song here');
   // console.log(Object.keys(song).length > 0);
    if (!song) {
        console.log(song);
        serverQueue.connection.destroy();
    //    player.stop();
        playlist.delete(guild.id);
        return;
    }
    const player = createAudioPlayer();
    player.on('error', error => {
        console.error('Error');
    });
    serverQueue.connection.subscribe(player);
    const stream = await ytdl(song.url, { filter: 'audioonly'}); // filter: format => format.container === 'webm'
    //console.log(join(__dirname, 'video.webm'));
    // let resource = createAudioResource(createReadStream(join(__dirname, 'video.webm'), {
    //      inputType: StreamType.WebmOpus,
    // }));
    // console.log(resource);
    // //resource.volume.setVolume(0.5);

    player.play(createAudioResource(stream, {seek: 0, volume: 0.5}));
    player.on('stateChange', (oldState, newState) => {
        console.log(`Audio player transitioned from ${oldState.status} to ${newState.status}`);
    });
    // player.on(AudioPlayerStatus.Idle, () => {
    //     serverQueue.songs.shift();
    //     play(guild, playlist.songs[0]);
    // });
    serverQueue.textChannel.send(`Now playing **${song.title}**`)
    // try {
    //     await entersState(player, AudioPlayerStatus.Playing, 5_000);
    //     // The player has entered the Playing state within 5 seconds
    //     console.log('Playback has started!');
    // } catch (error) {
    //     // The player has not entered the Playing state and either:
    //     // 1) The 'error' event has been emitted and should be handled
    //     // 2) 5 seconds have passed
    //     console.error(error);
    //     return;
    // }
    //console.log(serverQueue.connection);
    //interaction.reply(`Now playing ${song.title}`);
    // player.on(AudioPlayerStatus.Idle, () => {
    //     serverQueue.songs.shift();
    //     play(guild, serverQueue.songs[0]);
    // });
        // .play(ytdl(song.url))
        // .on('finish', () => {
        //     serverQueue.songs.shift();
        //     play(guild, serverQueue.songs[0]);
        // })
        // .on('error', error => console.error(error));
        // dispatcher.setVolumeLogarithmic(serverQueue.volume / 5);
        // serverQueue.textChannel.send(`Start playing: **${song.title}**`);
}
