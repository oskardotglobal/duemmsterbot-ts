/*
    A typescript twitch chatbot using twurple.js made for Schlauster
    Copyright (C) 2022  Oskar Manhart

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

import {promises as fs} from "fs";
import {Client, Intents} from "discord.js";
import {Headers} from "node-fetch";
import fetch from "node-fetch";

const rawConfig = await fs.readFile('./config.json');
const config = JSON.parse(rawConfig.toString());

class CustomClient extends Client {

    constructor() {
        const intents = new Intents(32767);
        super({ intents });
    }
}

class DiscordBot {
    public client: CustomClient;

    constructor() {
        const client = new CustomClient();

        client.on("ready", () => console.log("Connected to discord."));
        client.login(config.discord.token);

        client.on("messageCreate", async (message) => {
            if (!message.content.startsWith("!")) return;
            if (!message.inGuild()) return;
            if (message.guild.id != config.discord.guildId) return;

            const headers = new Headers();
            headers.append("Authorization", "Bearer " +  config.pufferpanel.tokenData.access_token);

            switch (message.content) {
                case "!startserver": {
                    if (!config.discord.serverManagers.includes(message.author.id)) return;
                    await this.renewToken();

                    await fetch(config.pufferpanel.baseUrl + "/daemon/server/" + config.pufferpanel.serverId + "/start", {
                        method: "POST",
                        headers: headers
                    }).catch(error => { console.error(error); return; });

                    break;
                }

                case "!stopserver": {
                    if (!config.discord.serverManagers.includes(message.author.id)) return;
                    await this.renewToken();

                    headers.append("Content-Type", "text/plain")

                    await fetch(config.pufferpanel.baseUrl + "/daemon/server/" + config.pufferpanel.serverId + "/console", {
                        method: "POST",
                        headers: headers,
                        body: "stop"
                    }).catch(error => { console.error(error); return; });

                    break;
                }
            }
        });

        this.client = client;
    }

    async renewToken() {
        const headers = new Headers();
        headers.append("Content-Type", "application/x-www-form-urlencoded")

        const body = new URLSearchParams();
        body.append("grant_type", "client_credentials");
        body.append("client_id", config.pufferpanel.clientId);
        body.append("client_secret", config.pufferpanel.clientSecret);

        await fetch(config.pufferpanel.baseUrl + "/oauth2/token", {
            method: "POST",
            body: body
        })
            .then(res => res.json())
            .then(json => { config.pufferpanel.tokenData = json; })
            .catch(error => { console.error(error); return; });
    }
}

export default DiscordBot;