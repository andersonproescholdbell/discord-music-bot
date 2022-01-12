const ytdl = require('ytdl-core');
const ytSearch = require('yt-search');
const { joinVoiceChannel, createAudioResource, createAudioPlayer, getVoiceConnection } = require('@discordjs/voice');

const queue = new Map();

module.exports = {
    name: 'play',
    async execute(message, command, args) {
        if (command === 'empty') return leave(message);

        const voiceChannel = message.member.voice.channel;
        console.log('hello');
        if (!voiceChannel) return message.reply('You need to be in a voice channel');

        if (command === 'leave') leave(message);
        else if (command === 'skip') skipSong(message, queue.get(message.guild.id));


        if (command === 'play') {
            if (!args.length) return message.reply('You need to send a search query after !play');

            let serverQueue = queue.get(message.guild.id);

            const song = await getSong(args.join(' '));
            if (!song) {
                message.reply('No video found');
                return;
            }

            if (!serverQueue) {
                const queueConstructor = {
                    voiceChannel: voiceChannel,
                    message: message,
                    songs: []
                };

                queue.set(message.guild.id, queueConstructor); 
                queueConstructor.songs.push(song);

                try {
                    const connection = await joinVoiceChannel({
                        channelId: voiceChannel.id,
                        guildId: message.guild.id,
                        adapterCreator: message.guild.voiceAdapterCreator,
                        selfDeaf: false
                    });

                    songPlayer(message.guild, queueConstructor.songs[0]);
                } catch(err) {
                    message.reply(`An error occured while connecting to the voice channel`);
                    throw err;
                }
            } else {
                serverQueue.songs.push(song);
                message.channel.send(`:fire: ***${song.title}*** has been added to the queue, song ${serverQueue.songs.length} in the queue`);
            }
        }
    }
}

const leave = (message) => {
    try {
        const connection = getVoiceConnection(message.guild.id);
        if (connection) {
            queue.delete(message.guild.id);
            connection.disconnect();
            return message.react('👋');
        } else {
            return message.reply('Not currently in a voice channel');
        }
    } catch(err) {
        queue.delete(message);
        getVoiceConnection(message).disconnect();
    }    
}

const skipSong = (message, serverQueue) => {
    if (!serverQueue) return message.reply('No songs in queue to skip');
    if (serverQueue.songs.length === 1) return leave(message);
    
    serverQueue.songs.shift();
    songPlayer(message.guild, serverQueue.songs[0]);
}

const getSong = async (search) => {
    const videoFinder = async (query) => {
        const videoResult = await ytSearch(query);
        return (videoResult.videos.length > 1) ? videoResult.videos[0] : null;
    }

    const video = await videoFinder(search);

    return video;
};

const songPlayer = async (guild, song) => {
    const songQueue = queue.get(guild.id);

    if (!song) {
        getVoiceConnection(guild.id).disconnect();
        queue.delete(guild.id);
        return;
    }

    const stream = ytdl(song.url, {filter: 'audioonly'});
    const resource = createAudioResource(stream);
    resource.volume.setVolume(0.1);
    const player = createAudioPlayer();

    const connection = getVoiceConnection(guild.id);
    await connection.subscribe(player);

    await player.play(resource);

    await songQueue.message.channel.send(`:fire: Now Playing ***${song.title}***, song 1 of ${songQueue.songs.length}`);

    player.addListener('stateChange', (prev, next) => {
        if (next.status === 'idle') {
            songQueue.songs.shift();
            songPlayer(guild, songQueue.songs[0]);
        }
    });
    // player.once(AudioPlayerStatus.Idle, () => {
    //     console.log('done');
    // });
};