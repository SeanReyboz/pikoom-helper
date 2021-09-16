const Discord = require('discord.js');
const { Intents } = require('discord.js');
const Cron = require('node-cron');
const { TOKEN, botChannelId, guildId } = require('./config.json');

const listeCommandes = require('./commands/commandes');

/** Création du client (bot)
 * Intents: 
 * Permettent de déterminer quels évènements le bot doit recevoir.
 * Il est impératif de fournir les Intents nécessaire pour la v.14 de
 * discord.js, sans quoi la création du client est impossible.
 * 
 *  - Intents possibles: 
 *    voir <https://discord.com/developers/docs/topics/gateway#list-of-intents>
 */
const client = new Discord.Client({
	intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] 
});

// Afficher un message dans la console lorsque le bot est prêt.
client.once('ready', () => {
	console.log(`Bot connecté en tant que ${client.user.tag}`);
});


client.on('ready', () => {

	// Afficher un rappel bi-hebdomadaire pour les réunions du lundi et mercredi
	Cron.schedule('1 * 19 * * 2,7', () => {
		client.channels.fetch(botChannelId).then(channel => {
			channel.send(":calendar: __RAPPEL__\nRéunion prévue demain, à la première pause.\n\nN'oubliez pas :heart:");
		});
	});
	Cron.schedule('1 30 9 * * 1', () => {
		client.channels.fetch(botChannelId).then(channel => {
			channel.send("/afficher -1");
		});
	});

	// Ajout des commandes au bot ----
	const guild = client.guilds.cache.get(guildId);
	let commands;

	if (guild)
		commands = guild.commands;
	else
		commands = client.application.commands;

	// ajouter la liste des commandes et leurs options respectives.
	commands.set(listeCommandes);

	// Ajout d'un message d'activité ----
	client.user.setPresence({
		activities: [
			{
				name: "Salut! Je m'appelle Bob!"
			}
		],
		status: "idle",
	});
});


//  ---   Gestion des Intéractions   ---

client.on('interactionCreate', async interaction => {
	if (!interaction.isCommand()) return;

	const { commandName, options } = interaction;

	if (commandName === 'ajouter') {
		// N.B: définir des valeurs par défaut au cas où
		const date = options.getString('date');
		const titre = options.getString('titre') || 'Nouvelle Deadline';
		const desc = options.getString('description') || '';
		const regex = /\d{2}-\d{2}-\d{4}/;

		// Vérifier que la date saisie soit validea.
		if (!regex.test(date)) {
			interaction.reply(`La date doit être de la forme JJ-MM-AAAA. Vous avez saisi: ${date}.`);
			return;
		}
		// TODO: vérifier que la date saisie soit cohérente.

		interaction.reply(`arguments: ${date} ${titre} ${desc}.`);

	} else if (commandName === 'supprimer') {
		const id = options.getInteger('deadline-id') || 0;
		interaction.reply(`You provided the deadline id: ${id}.`)
	} else if (commandName === 'modifier') {
		const id = options.getInteger('deadline-id') || 0;

		// TODO
	} else if (commandName === 'afficher') {
		const id = options.getInteger('deadline-id') || 0;

		// TODO
	}
	else if (commandName === 'suggestion') {
		// N.B: définir des valeurs par défaut au cas où
		const idea = options.getString('idea');
		const regex = /\d{2}/;		// Vérifier que la date saisie soit validea.
		if (!regex.test(idea)) {
			interaction.reply('vous devez saisir une idée');
			return;
		}
		// TODO: vérifier que la date saisie soit cohérente.
	

		interaction.reply(`:ballot_box: Suggestion ! :ballot_box:
@everyone
		

>	${idea} 
		
		
:white_check_mark: Je valide !
:x: Je suis contre !`);
	}
	
});

// Connecter le bot à Discord.
client.login(TOKEN).then(() => {
	console.log("--> Client connecté...");
}).catch(error => {
	console.log(error);
});
