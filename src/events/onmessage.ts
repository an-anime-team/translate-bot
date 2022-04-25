// Node imports and defining due to ESNext and Module settings
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Discord and other libraries
import { Discord, Guard, On } from 'discordx';
import type { ArgsOf } from 'discordx';
import { NotBot } from '@discordx/utilities';
import cld from 'cld';
import axios from 'axios';
import type { TextChannel } from 'discord.js';

//@ts-expect-error
let data = JSON.parse(fs.readFileSync(`${__dirname}/../data.json`));

const locales: Set<String> = new Set(['EN', 'NL', 'DE', 'SV', 'FI', 'RU', 'BG', 'RO', 'IT', 'FR']);

@Discord()
export class Events {
    @On("messageCreate")
    @Guard(NotBot)
    async onMessage([message]: ArgsOf<"messageCreate">): Promise<void> {
        if (message.channel.type == 'DM') return;
        cld.detect(message.content).then(async result => {
            if (result.languages.filter(language => language.code != 'en').length > 0) {
                message.channel.sendTyping();

                const response = await axios({
                    url: 'https://api-free.deepl.com/v2/translate',
                    method: 'post',
                    headers: {
                        'Content-Type': 'x-www-form-urlencoded'
                    },
                    params: {
                        auth_key: process.env.auth,
                        text: message.content,
                        target_lang: 'EN'
                    }
                });

                if (!data.webhooks.filter(hook => hook.channel == message.channelId).length) {
                    (message.channel as TextChannel).createWebhook(`Webhook #${message.channelId}`).then(webhook => {
                        data.webhooks.push({"channel": message.channelId, "id": webhook.id, "token": webhook.token});

                        fs.writeFileSync(`${__dirname}/../data.json`, JSON.stringify(data));
                    })
                }

                if (result.languages.filter(language => language.code != 'en' && language.code != response.data.translations[0].detected_source_language.toLowerCase()).length > 0) {
                    message.channel.send('This language is not supported by DeepL')
                } else {
                    message.channel.send(response.data.translations[0].text);
                }
            }
        }).catch(async (e: Error) => {
            if(e.message == 'Failed to identify language') {
                const response = await axios({
                    url: 'https://api-free.deepl.com/v2/translate',
                    method: 'post',
                    headers: {
                        'Content-Type': 'x-www-form-urlencoded'
                    },
                    params: {
                        auth_key: process.env.auth,
                        text: message.content,
                        target_lang: 'EN'
                    }
                });

                if (locales.has(response.data.translations[0].detected_source_language) && response.data.translations[0].text != message.content) {
                    message.channel.sendTyping();
                    message.channel.send(response.data.translations[0].text);
                } else if (response.data.translations[0].detected_source_language == 'EN') {
                    return
                }
            }
        });
    }
}