require('dotenv').config();
const fs = require('fs');

const {Client, Intents} = require('discord.js');
const client = new Client({intents: [Intents.FLAGS.GUILD_VOICE_STATES, Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, 
                                     Intents.FLAGS.GUILD_EMOJIS_AND_STICKERS, Intents.FLAGS.DIRECT_MESSAGES,
                                     Intents.FLAGS.GUILD_MESSAGE_REACTIONS]});

const PREFIX = '!';

client.commands = {};
const commandFiles = fs.readdirSync('./commands/').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    client.commands[command.name] = command;
}

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
    client.user.setActivity('!help', { type: 'LISTENING'});
});

client.on('interactionCreate', interaction => {
    //console.log(interaction);
    //no
});

client.on('voiceStateUpdate', (oldMember, newMember) => {
    client.commands.empty.execute(oldMember, newMember, client.user.id, client.commands);
});

client.on('messageCreate', message => {
    if (!message.content.startsWith(PREFIX) || message.author.bot) return;

    const args = message.content.slice(PREFIX.length).split(/ +/);
    const command = args.shift().toLowerCase();
    
    if (command === 'help') {
        client.commands.help.execute(message);
    } else if (command === 'play') {
        client.commands.play.execute(message, 'play', args);
    } else if (command === 'leave') {
        client.commands.play.execute(message, 'leave');
    } else if (command === 'skip') {
        client.commands.play.execute(message, 'skip');
    }       
});

client.login(process.env.CLIENT_TOKEN);