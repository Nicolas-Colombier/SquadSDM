<div align="center">

<br>

<img src="assets/Squad.png" alt="Logo" width="500"/>

<h1 align="center">Squad SDM</h1>
<h4 align="center">A JavaScript Discord bot to manage your Squad server </h4>

<p align="center">
    <a href="https://github.com/Nicolas-Colombier/SquadSDM#overview">Overview</a> •
    <a href="https://github.com/Nicolas-Colombier/SquadSDM#requirements">Requirements</a> •
    <a href="https://github.com/Nicolas-Colombier/SquadSDM#dependencies">Dependencies</a> •
    <a href="https://github.com/Nicolas-Colombier/SquadSDM#discord-bot-identity">Discord bot identity</a> •
    <a href="https://github.com/Nicolas-Colombier/SquadSDM#installation">Installation</a> •
    <a href="https://github.com/Nicolas-Colombier/SquadSDM#running-the-bot">Running the bot</a> •
    <a href="https://github.com/Nicolas-Colombier/SquadSDM#usage--management">Usage & Management</a> •
    <a href="https://github.com/Nicolas-Colombier/SquadSDM#credits">Credits</a>
</p>
</div>

<br>

## Overview

**SSDM** is a Discord bot adapted to manage your LinuxGSM Squad servers.

It provides essential features like:

- Start/Stop/Restart server
- Update server
- Get server details
- Manage multiple server configuration
- Install/Update/Delete mods
- Limit the usage to specific discord channels
- Limit the usage to specific discord roles
- Manage multiple servers that have independent permissions

If you need help or you want to share an idea for this bot, contact me on Discord : **nom4de**

<br>

## Requirements
* Linux machine only
* Git
* [Node.js v20.16.0](https://nodejs.org/en/)
* [LinuxGSM Squad server](https://linuxgsm.com/servers/squadserver/)
* [SteamCMD](https://docs.linuxgsm.com/steamcmd)
* SSH & Sudo access to the server hosting the Squad server

<br>

## Dependencies
**Discord.js** <br>
Powerful Node.js module that allows you to easily interact with the Discord API.
[See on npm](https://www.npmjs.com/package/discord.js)

**fs** <br>
Node.js file system module.
[See on npm](https://www.npmjs.com/package/fs)

**ssh2** <br>
SSH2 client and server modules written in pure JavaScript for node.js.
[See on npm](https://www.npmjs.com/package/ssh2)

<br>

## Discord bot identity

1. Go to the [Discord Developer Portal](https://discord.com/developers/applications) and create a new application.
2. In the general information tab, enter the name of your bot (this is only the developer portal's name) and the description you want. You can also add a profile picture.
3. Copy the application ID and enter it in the `config.json` file as the `clientID`
4. Then go the the bot tab and add the name you want to display inside Discord. If you need a banner, this is also the place to do it.
5. You can now reset the token and copy it in the `config.json` file as the `token`. **DO NOT SHARE THIS TOKEN WITH ANYONE** (if you do, regenerate it).
6. Go to the OAuth2 tab and select `bot` in the OAuth2 URL Generator. Then select the permissions you want to give to your bot (I suggest giving it administrator permissions for your server). Select Guild Install as the integration type. You can generate a different link for each server you want to add the bot to.
7. Copy the generated link and paste it in your browser. You can now add your bot to your server if you are admin.

<br>

## Installation

1. Clone the repository (or download the zip) :

```sh
git clone https://github.com/Nicolas-Colombier/SquadSDM.git
```

2. Go to the bot directory :

```sh
cd SquadSDM
```

3. Install `npm` dependencies :

```sh
npm install
```

4. Create a `config.json` file using the `config.json.example` template :

```sh
cp config.json.example config.json
```

5. Edit the `config.json` file with your Discord bot token and your Squad server SSH credentials :
- `token` : Your Discord bot token
- `activity` : The activity the bot will display (eg. "**Watching** *your activity*")
- `clientID` : Your Discord bot client ID
- `guildID` : Your Discord server ID
- `mods` : The list of mods that will be in the 'updatemod' and 'deletemod' commands (**DO NOT DELETE THE LAST ONE**).
- `server` : Each object is a server, if you have more then just add more object (be careful of the syntaxe). Each server can be on a different machine or user but need SSH access.
- `allowedChannels` : The ID of the channels where the bot can be used for this specific server (if empty, the bot can be used in all channels).
- `roles` : Each key is a command and the value is the ID of the role that can use this command (if empty, the command cannot be used).

6. Deploy the commands on the bot :

```sh
node utils/deployCommandsUtils.js
```
**DISCLAIMER** : This command need to be executed each time SquadSDM is updated.

<br>

## Running the bot

1. Create a systemd service to run the bot (from this point requires sudo access):

```sh
nano /etc/systemd/system/squad_sdm.service
```

2. Add the following content :

```
[Unit]
Description=Squad SDM

[Service]
Type=simple
User=name_of_your_linux_user
WorkingDirectory=/home/****/path_to_the_bot
ExecStart=/usr/bin/path_to_node /home/****/path_to_the_bot/index.js
Restart=always
RestartSec=3
SyslogIdentifier=name_of_your_linux_user

[Install]
WantedBy=multi-user.target
```

3. Reload the service files to include the new service (requires sudo access) :

```sh
sudo systemctl daemon-reload
```

4. Start the bot (requires sudo access) :

```sh
sudo systemctl start squad_sdm
```

5. Check the status of the bot (requires sudo access) :

```sh
sudo systemctl status squad_sdm
```

6. Enable the bot to start on boot (requires sudo access) :

```sh
sudo systemctl enable squad_sdm
```

<br>

## Usage & Management

To disable the bot to start on boot (requires sudo access) :

```sh
sudo systemctl disable squad_sdm
```

Stop the bot (requires sudo access) :

```sh
sudo systemctl stop squad_sdm
```

Take a look to the status and logs (requires sudo access) :

```sh
sudo systemctl status squad_sdm
```
```sh
sudo journalctl -u squad_sdm
```
```sh
sudo journalctl -fu squad_sdm
```

<br>

## Credits

- [Foxinou](https://github.com/FoxinouFR) - For the original idea and his help during development
