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
				name: '"/aide" pour lister les commandes.'
			}
		],
		status: "online",
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

		// Vérification de la cohérence de la date saisie.
		const elements = date.split('-');

		// Gérer les erreurs
		const invalidValueException = (type, min, max, element) => {
			interaction.reply(`:warning: **ERREUR**:\n\n> ${type} n'est pas valide.\n\nUne valeur comprise entre ${min} et ${max} attendue, "${element}" reçu.`)
		}

		if (elements[0] < 1 || elements[0] > 31) {
			invalidValueException("Le jour", 1, 31, elements[0]);
			return;
		}
		if (elements[1] < 1 || elements[1] > 12) {
			invalidValueException("Le mois", 1, 12, elements[1]);
			return;
		}
		if (elements[2] < 2021 || elements[2] > 2022) {
			invalidValueException("L'année", 2021, 2022, elements[2]);
			return;
		}

		interaction.reply(`arguments: ${date} ${titre} ${desc}.`);

	} else if (commandName === 'supprimer') {
		const id = options.getInteger('deadline-id') || 0;
		interaction.reply(`You provided the deadline id: ${id}.`)
	} else if (commandName === 'modifier') {
		const id = options.getInteger('deadline-id') || 0;

		// TODO
	} else if (commandName === 'afficher') {
		const id = options.getInteger('nombre') || 0;

		// TODO
	} else if (commandName === 'suggestion') {
		const idea = options.getString('idea') || "Nouvelle suggestion";

		interaction.reply(`:ballot_box: **Suggestion de ${interaction.user} !**\n`);
    // Puisqu'il est impossible de notifier des rôles dans une réponse d'interaction,
    // on envoie un autre message à la suite pour notifier @everyone
		const message = await interaction.channel.send({ 
			content: `@everyone \n\n> ${idea}\n\n:white_check_mark: Je valide !\n:x: Je suis contre !`,
			fetchReply: true,
		});
		message.react('✅');
		message.react('❌');
	} else if (commandName === 'annonce') {
		const message = options.getString('message') || "Nouvelle annonce.";

		interaction.reply(`:warning: **Annonce !!!**`);
		await interaction.channel.send(`\n@everyone\n\n> ${message}`);
	} else if (commandName === 'reunion') {
		const reunion = options.getString('reunion') || "Nouvelle réunion.";
		const role = options.getRole('role');
		const mention = (role) ? role : '@everyone';

		interaction.reply(`:date: **Réunion !!!**`);
		const message = await interaction.channel.send({ 
			content:`\n${mention}\n\n> ${reunion} \n\n:white_check_mark:  Pour lu !`, 
			fetchReply: true
		});
		message.react('✅');
	} else if (commandName === 'aide') {
		interaction.reply(`Liste des commandes disponibles...

- SYNOPSIS:
Une commande est de la forme "**/commande**". Elle accepte et/ou requiert parfois des options ou arguments.
Les arguments requis sont notés "**<argument>**", tandis que les options sont notées "**[option]**".

- DEADLINES:
**/ajouter <date> <titre> <description>** - Ajouter une nouvelle deadline.
**/afficher [nombre]** - Afficher des informations sur le nombre spécifié de deadlines. Défaut: la deadline plus proche.
**/modifier <deadline-id>** - Modifier la deadline spécifiée.
**/supprimer <deadline-id>** - Supprimer la deadline spécifiée.

- COMMUNICATION:
**/annonce <message>** - Créer une nouvelle annonce.
**/sugestion <idea>** - Créer une nouvelle sugestion.
**/reunion <reunion> [role]** - Annoncer une nouvelle réunion. Possibilité de notifier un rôle en particulier. Défaut: @everyone.

- GÉNÉRAL:
**/aide** - Afficher ce message d'aide.
		`);
	} 
});

// Connecter le bot à Discord.
client.login(TOKEN).then(() => {
	console.log("--> Client connecté...");
}).catch(error => {
	console.log(error);
});