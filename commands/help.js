module.exports = {
    name: 'help',
    execute(message) {
        message.reply(`!play <YouTube link> *optional:* volume <decimal 0-2>`);
    }
}