// Discord and other libraries
import { TextChannel, WebhookClient } from 'discord.js';
import { Discord, Guard, On } from 'discordx';
import type { ArgsOf } from 'discordx';
import { NotBot } from '@discordx/utilities';
import { dirname } from "@discordx/importer";
import cld from 'cld';
import axios from 'axios';
import fs from 'fs';
import { Main } from '../start.js';
import compareStrings from '../compare_strings.js';

const languageNames = new Intl.DisplayNames(['en'], {
    type: 'language'
});

const locales: Set<String> = new Set(['EN', 'NL', 'DE', 'SV', 'FI', 'RU', 'BG', 'RO', 'IT', 'FR', 'PL']);

const blocked_words: Set<String> = new Set([
    'damn',
    'nope',
    'i dont'
]);

// Some tests shown that 0.93 is average limit for similar translations
// like "HAHA" -> "HAHAHA", so I decided to make it 0.92 here
const STRINGS_SIMILARITY_LIMIT = 0.92;

@Discord()
export class Events {
    @On("messageCreate")
    @Guard(NotBot)
    async onMessage([message]: ArgsOf<"messageCreate">): Promise<void> {
        if (message.channel.type == 'DM') return;
        if (Main.Data.disabled.includes(message.channelId)) return;
        if (Main.Data.blockedusers.includes(message.author.id)) return;

        if (message.content.length > 1999) {
            message.channel.send('Your message is too long it has to be below 2000 characters');
            return;
        }

        // Don't translate what doesn't need to be translated
        if (blocked_words.has(message.content.toLowerCase())) {
            return;
        }
        
        cld.detect(message.content).then(async result => {
            if (result.languages.filter(language => language.code != 'en').length > 0) {
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

                // Don't send translation if it's pretty similar with original text
                if (!(compareStrings(response.data.translations[0].text, message.content) > STRINGS_SIMILARITY_LIMIT)) {

                    if (!Main.Data.webhooks.filter(hook => hook.channel == message.channelId).length) {
                        await (message.channel as TextChannel).createWebhook(`Webhook #${message.channelId}`).then(async webhook => {
                            Main.Data.webhooks.push({"channel": message.channelId, "id": webhook.id, "token": webhook.token});

                            fs.writeFileSync(`${dirname(import.meta.url)}/../data.json`, JSON.stringify(Main.Data));
                        })
                    }

                    if (result.languages.filter(language => language.code != 'en' && language.code != response.data.translations[0].detected_source_language.toLowerCase()).length > 0) {
                        return;
                    } else {
                        const currenthook = Main.Data.webhooks.filter(hook => hook.channel == message.channelId)[0];

                        const webhookClient = new WebhookClient({ id: currenthook.id, token: currenthook.token });

                        webhookClient.send({
                            content: response.data.translations[0].text,
                            username: `${message.author.username} (${languageNames.of(response.data.translations[0].detected_source_language)})`,
                            avatarURL: message.author.displayAvatarURL(),
                            allowedMentions: { "parse": [], repliedUser: false }
                        });
                    }
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
                    // Don't send translation if it's pretty similar with original text
                    if (!(compareStrings(response.data.translations[0].text, message.content) > STRINGS_SIMILARITY_LIMIT)) {

                        if (!Main.Data.webhooks.filter(hook => hook.channel == message.channelId).length) {
                            await (message.channel as TextChannel).createWebhook(`Webhook #${message.channelId}`).then(async webhook => {
                                Main.Data.webhooks.push({"channel": message.channelId, "id": webhook.id, "token": webhook.token});
        
                                fs.writeFileSync(`${dirname(import.meta.url)}/../data.json`, JSON.stringify(Main.Data));
                            })
                        }

                        const currenthook = Main.Data.webhooks.filter(hook => hook.channel == message.channelId)[0];

                        const webhookClient = new WebhookClient({ id: currenthook.id, token: currenthook.token });

                        webhookClient.send({
                            content: response.data.translations[0].text,
                            username: `${message.author.username} (${languageNames.of(response.data.translations[0].detected_source_language)})`,
                            avatarURL: message.author.displayAvatarURL(),
                            allowedMentions: { "parse": [], repliedUser: false }
                        });
                    }
                } else if (response.data.translations[0].detected_source_language == 'EN') {
                    return
                }
            }
        });
    }
}
