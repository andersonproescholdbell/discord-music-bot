module.exports = {
    name: 'empty',
    async execute(oldMember, newMember, botId, commands) {
        newMember.guild.channels.cache.forEach((value) => {
            if (value.type === 'GUILD_VOICE' && value.members.has(botId)) {
                if (value.members.size === 1) return commands.play.execute(newMember.guild.id, 'empty');
            }
        });
        return;
    }
}