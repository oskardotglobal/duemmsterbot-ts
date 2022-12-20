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
import {ApiClient} from '@twurple/api';
import {ChatClient} from '@twurple/chat';
import {RefreshingAuthProvider} from '@twurple/auth';
import {MessageEmbed, Client} from "discord.js";

const rawConfig = await fs.readFile('./config.json');
const config = JSON.parse(rawConfig.toString());

const clientId = config.twitch.clientId;
const clientSecret = config.twitch.clientSecret;

class TwitchBot {
    private authProvider: RefreshingAuthProvider;
    private apiClient: ApiClient;
    private chatClient: ChatClient;

    private discordClient: Client;

    constructor(discordClient: Client) {
        const authProvider = new RefreshingAuthProvider(
            {
                clientId,
                clientSecret,
                onRefresh: async (newTokenData) => {
                    config.twitch.tokenData = newTokenData;
                    await fs.writeFile('./config.json', JSON.stringify(config, null, 2));
                    console.log('Token refreshed.');
                },
            },
            config.twitch.tokenData
        );

        const apiClient = new ApiClient({authProvider});
        const chatClient = new ChatClient({authProvider, channels: ['schlauster']});

        this.authProvider = authProvider;
        this.apiClient = apiClient;
        this.chatClient = chatClient;
        this.discordClient = discordClient;
    }

    async run() {
        const chatClient = this.chatClient;
        const apiClient = this.apiClient;
        const discordClient = this.discordClient;

        await chatClient.connect().then(() => {
            console.log('Connected to twitch chat.');
        });

        chatClient.onMessage(async (channel, user, message, msg) => {
            if (message.startsWith('!')) {
                switch (message) {

                    case '!clip': {
                        apiClient.users.getUserByName(channel.slice(1)).then(async (user) => {
                            if (user) {
                                await apiClient.clips
                                    .createClip({channelId: user.id})
                                    .then(async (clipId) => {
                                        await chatClient.say(
                                            channel,
                                            `Clip erstellt. Du findest ihn im #twitch-clips Kanal.`
                                        );
                                        const clipsChannel = discordClient.channels.cache.get('955532990077870087');
                                        if (clipsChannel) {
                                            const embed = new MessageEmbed()
                                                .setColor('RANDOM')
                                                .setTitle('Neuer Clip erstellt von ' + msg.userInfo.userName + '!')
                                                .setURL('https://clips.twitch.tv/' + clipId)
                                                .setFooter({text: 'https://twitch.tv/schlauster'});
                                            // @ts-ignore
                                            clipsChannel.send({embeds: [embed]});
                                        }
                                    });
                            } else await chatClient.say(
                                channel,
                                'Es ist ein Fehler aufgetreten.'
                            );
                        });
                        break;
                    }

                    case '!prime': {
                        await chatClient.say(
                            channel,
                            'Prime-Subs sind KOSTENLOS!'
                        );
                        break;
                    }

                    case '!say': {
                        if (msg.userInfo.userName.toLowerCase() != "pixelagent007") return;

                        await chatClient.say(
                            channel,
                            message.substring(3)
                        );
                        break;
                    }

                    case '!zettel': {
                        await chatClient.say(
                            channel,
                            "https://clips.twitch.tv/StormyKawaiiButterflyTwitchRPG-dA2_xN7woWm-LqNm"
                        );
                        break;
                    }

                    case '!summonjari': {
                        if (msg.userInfo.userName.toLowerCase() != "pixelagent007" || msg.userInfo.userName.toLowerCase() != "schlauster") return;

                        await chatClient.say(
                            channel,
                            "@ausrufezeichenjari @jaribruchdari @jaridari12 PETTHEMODS"
                        );
                        break;
                    }

                    case '!discord' || '!dc': {
                        await chatClient.say(
                            channel,
                            'https://dsc.gg/schlauster'
                        );
                        break;
                    }

                }
            }
        });
    }
}

export default TwitchBot;