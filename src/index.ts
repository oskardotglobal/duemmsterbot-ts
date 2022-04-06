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
            await fs.writeFile('./config.json', JSON.stringify(config, null, 2));
            console.log('Token refreshed.');
        }
    },
    config.tokenData
);

// Creating the api client for later use
const apiClient = new ApiClient({authProvider});

// Creating the chat client
const chatClient = new ChatClient({ authProvider, channels: ['schlauster'] });
await chatClient.connect();