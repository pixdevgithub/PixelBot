const Event = require('../../Structures/Event');

module.exports = class extends Event {

	async run(message) {
		const mentionRegex = RegExp(`^<@!?${this.client.user.id}>$`);
		const mentionRegexPrefix = RegExp(`^<@!?${this.client.user.id}> `);

		if (message.author.bot) return;

		if (message.content.match(mentionRegex)) message.channel.send(`My Prefix Is \`${this.client.prefix}\` Or <@805449154167046144>.`);

		const prefix = message.content.match(mentionRegexPrefix) ?
			message.content.match(mentionRegexPrefix)[0] : this.client.prefix;

		if (!message.content.startsWith(prefix)) return;

		const [cmd, ...args] = message.content.slice(prefix.length).trim().split(/ +/g);

		const command = this.client.commands.get(cmd.toLowerCase()) || this.client.commands.get(this.client.aliases.get(cmd.toLowerCase()));
		if (command) {
            if (command.ownerOnly && !this.client.utils.checkOwner(message.author)) {
				return message.reply('Whoops, This Command Can Only Be Used By The Bot Owner(s).');
			}

			if (command.guildOnly && !message.guild) {
				return message.reply('Sorry, This Command Can Only Be Used In A Discord Server.');
			}

			if (command.nsfw && !message.channel.nsfw) {
				return message.reply('This Command Can Only Be Used In A NSFW Marked Channel.');
			}

			if (command.args && !args.length) {
				return message.reply(`Sorry, This Command Requires Arguments To Function. Usage: ${command.usage ?
				command.usage : 'This Command Doesn\'t Have A Usage Format'}.`)
			}

			const userPermCheck = command.userPerms ? this.client.defaultPerms.add(command.userPerms) : this.client.defaultPerms;
			if (message.guild && userPermCheck) {
				const missing = message.channel.permissionsFor(message.member).missing(userPermCheck);
				if (missing.length) {
					return message.reply(`You Are Missing ${this.client.utils.formatArray(missing.map(this.client.utils.formatPerms))} Permissions, You Need Em To Use This Command.`);
				}
			}

			const botPermCheck = command.botPerms ? this.client.defaultPerms.add(command.botPerms) : this.client.defaultPerms;
			if (message.guild && botPermCheck) {
				const missing = message.channel.permissionsFor(this.client.user).missing(botPermCheck);
				if (missing.length) {
					return message.reply(`You Are Missing ${this.client.utils.formatArray(missing.map(this.client.utils.formatPerms))} Permissions, You Need Em To Use This Command.`);
				}
			}

			command.run(message, args);
		}
	}

};
