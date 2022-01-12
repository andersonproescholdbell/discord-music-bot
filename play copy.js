const ytdl = require('ytdl-core');
const ytSearch = require('yt-search');
const { joinVoiceChannel, createAudioResource, createAudioPlayer, getVoiceConnection } = require('@discordjs/voice');

const queue = new Map();

module.exports = {
    name: 'play',
    async execute(message, args) {
        const voiceChannel = message.member.voice.channel;
        if (!voiceChannel) return message.reply('You need to be in a voice channel');
        if (!args.length) return message.reply('You need to send a search query after !play');

        let serverQueue = queue.get(message.guild.id);

        if (!serverQueue) {
            const queueConstructor = {
                voiceChannel: voiceChannel,
                message: message,
                connection: null,
                songs: []
            };
        }
        
        try {
            const connection = await joinVoiceChannel({
                channelId: voiceChannel.id,
                guildId: message.guild.id,
                adapterCreator: message.guild.voiceAdapterCreator,
                selfDeaf: false
            });
    
            const videoFinder = async (query) => {
                const videoResult = await ytSearch(query);
                return (videoResult.videos.length > 1) ? videoResult.videos[0] : null;
            }
    
            const video = await videoFinder(a.shift());
    
            if (video) {
                const stream = ytdl(video.url, {filter: 'audioonly'});
                const resource = createAudioResource(stream);
                const player = createAudioPlayer();
    
                await connection.subscribe(player);
    
                await player.play(resource);

                player.addListener('stateChange', (prev, next) => {
                    if (next.status === 'idle') {
                        serverQueue.shift();
                        if (serverQueue.length > 0) {

                        } else {
                            getVoiceConnection(message.guild.id).disconnect();
                        }
                    }
                });
    
                await message.reply(`:fire: Now Playing ***${video.title}***`);
            } else {
                message.reply('No video found');
            }
        } catch(error) {
            message.reply(`There was an unhandled error: ${error.toString().substring(0,200)}`);
        }
    }
}