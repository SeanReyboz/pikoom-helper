/**
 * @file commands/commandes.js
 * @description définition d'un tableau d'objet contenant toutes les propriétes
 * de toutes les commandes du bot.
 * 
 * NOTE: Le nom d'une commande doit impérativement commencer par une lettre
 *       minuscule et correspondre à l'expression régulière suivante:
 *       ^[\w-]{1,32}$ 
 */
const Discord = require('discord.js');

module.exports = [
	{
		name: 'ajouter',
		description: 'Ajouter une deadline.',
		options: [
			{
				name: 'date',
				description: 'La date de la deadline, au format: <JJ-MM-AAAA>.',
				required: true,
				type: Discord.Constants.ApplicationCommandOptionTypes.STRING,
			},
			{
				name: 'titre',
				description: 'Le titre de la nouvelle deadline.',
				required: true,
				type: Discord.Constants.ApplicationCommandOptionTypes.STRING,
			},
			{
				name: 'description',
				description: 'La description de la nouvelle deadline.',
				required: true,
				type: Discord.Constants.ApplicationCommandOptionTypes.STRING,
			},
		],
	},
	{
		name: 'supprimer',
		description: 'Supprimer la deadline spécifiée.',
		options: [
			{
				name: 'deadline-id',
				description: 'L\'identifiant de la deadline à supprimer.',
				required: true,
				type: Discord.Constants.ApplicationCommandOptionTypes.INTEGER,
			},
		],
	},
	{
		name: 'modifier',
		description: 'Modifier une deadline existante.',
		options: [
			{
				name: 'deadline-id',
				description: "L'identifiant de la deadline à modifier.",
				required: true,
				type: Discord.Constants.ApplicationCommandOptionTypes.INTEGER,
			},
		],
	},
	{
		name: 'suggestion',
		description: 'Créer une nouvelle suggestion.',
		options: [
			{
				name: 'idea',
				description: "Le contenu de la suggestion à ajouter.",
				required: true,
				type: Discord.Constants.ApplicationCommandOptionTypes.STRING,
			},
		],
	},
	{
		name: 'afficher',
		description: 'Afficher le temps restant avant la deadline la plus proche.',
		options: [
			{
				name: 'deadline-id',
				description: "L'identifiant de la deadline à afficher. -1 = toutes les deadlines.",
				type: Discord.Constants.ApplicationCommandOptionTypes.INTEGER,
			},
		],
	},
];