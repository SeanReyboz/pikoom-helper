const Discord = require('discord.js');
const { Intents } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const Cron = require('node-cron');
const { TOKEN, botChannelId } = require('./config.json');

// --- Création du client (bot) ---

// Intents possibles: GUILDS, GUILD_MESSAGES, GUILD_MESSAGE_REACTIONS
const client = new Discord.Client({ intents: [Intents.FLAGS.GUILDS] });

// Afficher un message dans la console lorsque le bot est prêt.
client.once('ready', () => {
	console.log(`Bot connecté en tant que ${client.user.tag}`);
});


// Afficher un rappel bi-hebdomadaire pour les réunions du lundi et mercredi
client.on('ready', () => {
	Cron.schedule('1 * 19 * * 2,7', () => {
		client.channels.fetch(botChannelId).then(channel => {
			channel.send(":calendar: __RAPPEL__\nRéunion prévue demain, à la première pause.\n\nN'oubliez pas :heart:");
		});
	});
});


// Connecter le bot à Discord.
client.login(TOKEN).then(() => {
	console.log("--> Client connecté...");
}).catch(error => {
	console.log(error);
});
