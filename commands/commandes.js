/**
 * @file commands/commandes.js
 * @description définition d'un tableau d'objet contenant toutes les propriétes
 * de toutes les commandes du bot.
 *
 * NOTE: Le nom d'une commande doit impérativement commencer par une lettre
 *       minuscule et correspondre à l'expression régulière suivante:
 *       ^[\w-]{1,32}$
 */
const Discord = require("discord.js");

module.exports = [
  {
    name: "ajouter",
    description: "Ajouter une deadline.",
    options: [
      {
        name: "date",
        description: "La date de la deadline, au format: <JJ-MM-AAAA>.",
        required: true,
        type: Discord.Constants.ApplicationCommandOptionTypes.STRING,
      },
      {
        name: "titre",
        description: "Le titre de la nouvelle deadline.",
        required: true,
        type: Discord.Constants.ApplicationCommandOptionTypes.STRING,
      },
      {
        name: "description",
        description: "La description de la nouvelle deadline.",
        required: true,
        type: Discord.Constants.ApplicationCommandOptionTypes.STRING,
      },
    ],
  },
  {
    name: "supprimer",
    description: "Supprimer la deadline spécifiée.",
    options: [
      {
        name: "deadline-id",
        description: "L'identifiant de la deadline à supprimer.",
        required: true,
        type: Discord.Constants.ApplicationCommandOptionTypes.INTEGER,
      },
    ],
  },
  {
    name: "modifier",
    description: "Modifier une deadline existante.",
    options: [
      {
        name: "deadline-id",
        description: "L'identifiant de la deadline à modifier.",
        required: true,
        type: Discord.Constants.ApplicationCommandOptionTypes.INTEGER,
      },
    ],
  },
  {
    name: "suggestion",
    description: "Créer une nouvelle suggestion.",
    options: [
      {
        name: "idea",
        description: "Le contenu de la suggestion à ajouter.",
        required: true,
        type: Discord.Constants.ApplicationCommandOptionTypes.STRING,
      },
    ],
  },
  {
    name: "annonce",
    description: "Créer une nouvelle annonce.",
    options: [
      {
        name: "message",
        description: "Le contenu de l'annonce à ajouter.",
        required: true,
        type: Discord.Constants.ApplicationCommandOptionTypes.STRING,
      },
    ],
  },
  {
    name: "reunion",
    description: "Annoncer une nouvelle réunion.",
    options: [
      {
        name: "reunion",
        description: "Le contenu de la réunion à ajouter.",
        required: true,
        type: Discord.Constants.ApplicationCommandOptionTypes.STRING,
      },
      {
        name: "role",
        description: "Notifier les personnes du rôle spécifié.",
        type: Discord.Constants.ApplicationCommandOptionTypes.ROLE,
      },
    ],
  },
  {
    name: "afficher",
    description: "Afficher le temps restant avant la deadline la plus proche.",
  },
  {
    name: "aide",
    description: "Afficher un message d'aide d'utilisation des commandes",
  },
  {
    name: "test",
    description: "Quand ca roule...",
  },
];
