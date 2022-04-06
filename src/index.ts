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
import { RefreshingAuthProvider } from '@twurple/auth';
import { promises as fs } from 'fs';

const clientId = 'YOUR_CLIENT_ID';
const clientSecret = 'YOUR_CLIENT_SECRET';

const tokenData = async () => {
    const token = await fs.readFile('./config.json', 'utf8');
    return JSON.parse(token);
};

const authProvider = new RefreshingAuthProvider(
    {
        clientId,
        clientSecret,
        onRefresh: async newTokenData => await fs.writeFile('./config.json', JSON.stringify(newTokenData, null, 4), 'UTF-8')
    },
    tokenData
);