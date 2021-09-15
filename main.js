const Discord = require('discord.js');
const { Intents } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const Cron = require('node-cron');
const { TOKEN } = require('./config.json');

// --- Création du client (bot) ---

// Intents possibles: GUILDS, GUILD_MESSAGES, GUILD_MESSAGE_REACTIONS
const client = new Discord.Client({ intents: [Intents.FLAGS.GUILDS] });
const botChannelId = ''; // identifiant du channel du bot.


// Afficher un message dans la console lorsque le bot est prêt.
client.once('ready', () => {
	console.log(`Bot connecté en tant que ${client.user.tag}`);
});

client.on('ready', () => {
	channel = client.channels.cache.get('779878152071282688'); //id channel
		cron.schedule('1 * 19 * * 2,7', () => {
				channel.send(":calendar: __RAPPEL__\nRéunion prévue demain, à la première pause.\n\nN'oubliez pas :heart:");
	});
});
// Connecter le bot à Discord.
client.login(TOKEN).then(() => {
	console.log("--> Client connecté...");
}).catch(error => {
	console.log(error);
});
