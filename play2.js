//const youtubedl = require('youtube-dl-exec');
//const ytSearch = require('yt-search');
const { joinVoiceChannel, createAudioResource, createAudioPlayer, StreamType, NoSubscriberBehavior, getVoiceConnection } = require('@discordjs/voice');

module.exports = {
    name: 'play',
    async execute(message, args) {
        if (!message.member.voice.channel) return message.reply('You need to be in a voice channel');
        if (!args.length) return message.reply('You need to send a search query after !play');

        joinVoiceChannel({
            channelId: message.member.voice.channel.id,
            guildId: message.guild.id,
            adapterCreator: message.guild.voiceAdapterCreator,
            selfDeaf: false
        });

        const audioPlayer = createAudioPlayer({
            behaviors: {
                noSubscriber: NoSubscriberBehavior.Pause,
            },
        });

        const resource = createAudioResource('./file.mp3');
        audioPlayer.play(resource);

        const connection = getVoiceConnection(message.guild.id);

        const subscription = connection.subscribe(audioPlayer);

        console.log(connection);
        

        // const videoFinder = async (query) => {
        //     const videoResult = await ytSearch(query);
        //     return (videoResult.videos.length > 1) ? videoResult.videos[0] : null;
        // }

        // const video = await videoFinder(args.join(' '));

        // if (video) {
        //     const stream = youtubedl(video.url, {
        //         o: '-',
        //         q: '',
        //         f: 'bestaudio[ext=webm+acodec=opus+asr=48000]/bestaudio',
        //         r: '100K',
        //     }, { stdio: ['ignore', 'pipe', 'ignore'] });

        //     const player = createAudioPlayer();

        //     const connection = await joinVoiceChannel({
        //         channelId: message.member.voice.channel.id,
        //         guildId: message.guild.id,
        //         adapterCreator: message.guild.voiceAdapterCreator,
        //         selfDeaf: false
        //     });

        //     const resource = createAudioResource(stream.stdout);

        //     //await connection.subscribe(player);

        //     player.play(resource);

        //     try {
        //         await entersState(connection, VoiceConnectionStatus.Ready, 30_000);
        //         connection.subscribe(player);
        //         await message.reply(`:thumbsup: Now Playing ***${video.title}***`);
        //     } catch (error) {
        //         connection.destroy();
        //         throw error;
        //     }
        // } else {
        //     message.reply('No video found');
        // }
    }
}