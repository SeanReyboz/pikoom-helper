# pikoom-helper

Un bot Discord permettant de simplifier la gestion de l'emploi du temps de
l'agence Pikoom

# Installation

```sh
git clone https://github.com/SeanReyboz/pikoom-helper
cd pikoom-helper
npm install
```
Créer un fichier `config.json` dans le dossier `pikoom-helper`, puis compléter
avec les informations suivantes:

```json
{
	"TOKEN": "Le token du bot discord",
	"botChannelId": "L'id du salon textuel dédié au bot",
	"guildId": "L'id du serveur/guild à utiliser",
}
```

# Usage 

Lancer le bot avec `node .` dans le dossier `pikoom-helper`.

Pour afficher les commandes disponibles, exécuter la commande: `/aide` dans un
salon textuel du serveur concerné.
