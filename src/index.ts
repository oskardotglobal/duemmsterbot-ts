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

// Importing the required packages
import { ApiClient } from '@twurple/api';
import { ChatClient } from '@twurple/chat';
import { RefreshingAuthProvider } from '@twurple/auth';
import { promises as fs } from 'fs';
import { Client, Intents, MessageEmbed } from 'discord.js';

// Loading the config file
const rawConfig = await fs.readFile('./config.json');
let config = JSON.parse(rawConfig.toString());

const clientId = config.clientId;
const clientSecret = config.clientSecret;

// Creating the auth provider
const authProvider = new RefreshingAuthProvider(
    {
        clientId,
        clientSecret,
        onRefresh: async (newTokenData) => {
            config.tokenData = newTokenData;
            await fs.writeFile(
                './config.json',
                JSON.stringify(config, null, 2)
            );
            console.log('Token refreshed.');
        },
    },
    config.tokenData
);

// Creating the api client for later use
const apiClient = new ApiClient({ authProvider });


// Creating the chat client
const chatClient = new ChatClient({ authProvider, channels: ['schlauster'] });

// Logging into the client
await chatClient.connect().then(() => {
    console.log('Connected to twitch chat.');
});


// Creating the discord client
const intents = new Intents(32767);
const discordClient = new Client({ intents });

// Setting status
discordClient.on('ready', () => {
    console.log('Connected to discord.');
    // @ts-ignore
    discordClient.user.setActivity("Schlauster's Stream", { type: "WATCHING"})
});

// Logging into the client
discordClient.login(config.discordToken);

// Command handler
chatClient.onMessage(async (channel, user, message, msg) => {
    if (message.startsWith('!')) {
        switch (message) {

            case '!clip': {
                apiClient.users.getUserByName(channel.slice(1)).then( async (user) => {
                    if (user) {
                        await apiClient.clips
                            .createClip({ channelId: user.id })
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
                                        .setFooter({ text: 'https://twitch.tv/schlauster' });
                                    // @ts-ignore
                                    clipsChannel.send({ embeds: [embed] });
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
            case '!discord': {
                await chatClient.say(
                    channel,
                    'https://dsc.gg/schlauster'
                );
                break;
            }

        }
    }
});
