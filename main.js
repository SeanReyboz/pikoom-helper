const Discord = require("discord.js");
const { Client, Intents } = require("discord.js");
const Cron = require("node-cron");
const Sequelize = require("sequelize");
const moment = require("moment");
const { TOKEN, botChannelId, guildId } = require("./config.json");

const listeCommandes = require("./commands/commandes");

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
  intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES],
});

// Base de données
const sequelize = new Sequelize("database", "user", "password", {
  host: "localhost",
  dialect: "sqlite",
  logging: false,
  storage: "database.sqlite",
});

// Création du modèle
// NOTE: aucune clé primaire n'est définie ici, car sequelize en créer une par
// défaut.
const Deadlines = sequelize.define("deadlines", {
  title: Sequelize.STRING,
  description: Sequelize.TEXT,
  date: {
    type: Sequelize.DATE,
    get() {
      // Modifier le format de la date retournée...
      return moment(this.getDataValue("date")).format("DD/MM/YYYY");
    },
  },
});

// Afficher un message dans la console lorsque le bot est prêt.
client.once("ready", () => {
  console.log(`Bot connecté en tant que ${client.user.tag}`);
  // Vérifier que le modèle existe dans la BDD
  Deadlines.sync();
});

client.on("ready", () => {
  // Afficher un rappel bi-hebdomadaire pour les réunions du lundi et mercredi
  // RAPPEL: Secondes Minutes Heures Jour-du-Mois Mois Jour-de-la-Semaine !!!
  Cron.schedule("1 1 19 * * 2,7", () => {
    client.channels.fetch(botChannelId).then((channel) => {
      channel.send(
        ":calendar: __RAPPEL__\nRéunion prévue demain, à la première pause.\n\nN'oubliez pas :heart:"
      );
    });
  });

  Cron.schedule("1 30 9 * * 1", async () => {
    const closestDeadline = await Deadlines.findOne({
      order: [["date", "ASC"]],
    });
    const deadline = closestDeadline.dataValues;
    // convertir la date:
    deadline.date = moment(deadline.date).format("DD/MM/YYYY");
    client.channels.fetch(botChannelId).then((channel) => {
      channel.send(
        `:warning: **RAPPEL DEADLINE !!** :warning:\n\n**${deadline.title}**\n${deadline.description}\n\n> Date: __*${deadline.date}*__\n@everyone`
      );
    });
  });

  // Ajout des commandes au bot ----
  const guild = client.guilds.cache.get(guildId);
  let commands;

  if (guild) commands = guild.commands;
  else commands = client.application.commands;

  // ajouter la liste des commandes et leurs options respectives.
  commands.set(listeCommandes);

  // Ajout d'un message d'activité ----
  client.user.setPresence({
    activities: [
      {
        name: '"/aide" pour lister les commandes.',
      },
    ],
    status: "online",
  });
});

//  ---   Gestion des Intéractions   ---

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isCommand()) return;

  const { commandName, options } = interaction;

  if (commandName === "ajouter") {
    // N.B: définir des valeurs par défaut au cas où
    let date = options.getString("date");
    const titre = options.getString("titre") || "Nouvelle Deadline";
    const desc = options.getString("description") || "";
    const regex = /\d{2}-\d{2}-\d{4}/;

    // Vérifier que la date saisie soit validea.
    if (!regex.test(date)) {
      return interaction.reply(
        `La date doit être de la forme JJ-MM-AAAA. Vous avez saisi: ${date}.`
      );
    }

    // Vérification de la cohérence de la date saisie.
    const elements = date.split("-");

    // Gérer les erreurs
    const invalidValueException = (type, min, max, element) => {
      return interaction.reply(
        `:warning: **ERREUR**:\n\n> ${type} n'est pas valide.\n\nUne valeur comprise entre ${min} et ${max} attendue, "${element}" reçu.`
      );
    };

    if (elements[0] < 1 || elements[0] > 31) {
      return invalidValueException("Le jour", 1, 31, elements[0]);
    }
    if (elements[1] < 1 || elements[1] > 12) {
      return invalidValueException("Le mois", 1, 12, elements[1]);
    }
    if (elements[2] < 2021 || elements[2] > 2022) {
      return invalidValueException("L'année", 2021, 2022, elements[2]);
    }

    // Réassembler la date dans un format supporté par sqlite.
    date = `${elements[2]}-${elements[1]}-${elements[0]} 12:00:00`;

    try {
      const deadline = await Deadlines.create({
        title: titre,
        description: desc,
        date: date,
      });
      return interaction.reply(
        `La deadline intitulée "${titre}" a bien été ajoutée!`
      );
    } catch (error) {
      if (error.name === "SequelizeUniqueConstraintError") {
        return interaction.reply("L'identifiant est déjà utilisé.");
      }
      return interaction.reply(
        "Oops! Une erreur s'est produite lors de l'ajout de la deadline."
      );
    }
  } else if (commandName === "supprimer") {
    const id = options.getInteger("deadline-id") || 0;

    // Supprimer la deadline d'ID spéficié
    const rowCount = await Deadlines.destroy({ where: { id: id } });

    if (!rowCount)
      return interaction.reply(`La deadline "${id}" n'existe pas.`);

    return interaction.reply(`La deadline "${id}" a bien été supprimée.`);
  } else if (commandName === "afficher") {
    let message = ":calendar: **LISTE des DEADLINES** :calendar:";

    try {
      const deadlines = await Deadlines.findAll();
      const len = deadlines.length;

      if (len === 0) {
        return interaction.reply(
          "Il n'y a aucune deadline (...pour l'instant ;) )"
        );
      }

      for (let i = 0; i < len; i++) {
        message += `\n\n---\nDeadline n° ${deadlines[i].id} -- **${deadlines[i].title}**\n\n${deadlines[i].description}\n\n> DEADLINE: __*${deadlines[i].date}*__`;
      }
      return interaction.reply(message);
    } catch (error) {
      console.log(error);
      return interaction.reply(
        "Oops! Quelque chose s'est mal passé lors de la récupération de la liste des deadlines."
      );
    }
  } else if (commandName === "suggestion") {
    const idea = options.getString("idea") || "Nouvelle suggestion";

    interaction.reply(`:ballot_box: **Suggestion de ${interaction.user} !**\n`);
    // Puisqu'il est impossible de notifier des rôles dans une réponse d'interaction,
    // on envoie un autre message à la suite pour notifier @everyone
    const message = await interaction.channel.send({
      content: `@everyone \n\n> ${idea}\n\n:white_check_mark: Je valide !\n:x: Je suis contre !`,
      fetchReply: true,
    });
    message.react("✅");
    message.react("❌");
  } else if (commandName === "annonce") {
    const message = options.getString("message") || "Nouvelle annonce.";

    interaction.reply(`:warning: **Annonce !!!**`);
    await interaction.channel.send(`\n@everyone\n\n> ${message}`);
  } else if (commandName === "reunion") {
    const reunion = options.getString("reunion") || "Nouvelle réunion.";
    const role = options.getRole("role");
    const mention = role ? role : "@everyone";

    interaction.reply(`:date: **Réunion !!!**`);
    const message = await interaction.channel.send({
      content: `\n${mention}\n\n> ${reunion} \n\n:white_check_mark:  Pour lu !`,
      fetchReply: true,
    });
    message.react("✅");
  } else if (commandName === "aide") {
    return interaction.reply(`Liste des commandes disponibles...

- SYNOPSIS:
Une commande est de la forme "**/commande**". Elle accepte et/ou requiert parfois des options ou arguments.
Les arguments requis sont notés "**<argument>**", tandis que les options sont notées "**[option]**".

- DEADLINES:
**/ajouter <date> <titre> <description>** - Ajouter une nouvelle deadline.
**/afficher** - Afficher toutes les deadlines existantes.
**/supprimer <deadline-id>** - Supprimer la deadline spécifiée.

- COMMUNICATION:
**/annonce <message>** - Créer une nouvelle annonce.
**/sugestion <idea>** - Créer une nouvelle sugestion.
**/reunion <reunion> [role]** - Annoncer une nouvelle réunion en notifiant un rôle en particulier. Défaut: @everyone.

- GÉNÉRAL:
**/aide** - Afficher ce message d'aide.
		`);
  } else if (commandName === "test")
    return interaction.reply(
      "> Quand ça tourne, ça marche.\n- *Inconnu, 2021*"
    );
});

// Connecter le bot à Discord.
client
  .login(TOKEN)
  .then(() => {
    console.log("--> Client connecté...");
  })
  .catch((error) => {
    console.log(error);
  });
