import { Discord, Guard, On } from 'discordx';
import type { ArgsOf } from 'discordx';
import { NotBot } from '@discordx/utilities';
import cld from 'cld';
import axios from 'axios';

@Discord()
export class Events {
    @On("messageCreate")
    @Guard(NotBot)
    async onMessage([message]: ArgsOf<"messageCreate">): Promise<void> {
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

                if (response.data.translations[0].detected_source_language == 'NL' || response.data.translations[0].detected_source_language == 'DE' ||  response.data.translations[0].detected_source_language == 'RO' || response.data.translations[0].detected_source_language == 'BG' || response.data.translations[0].detected_source_language == 'IT' || response.data.translations[0].detected_source_language == 'FR' && response.data.translations[0].text != message.content || response.data.translations[0].detected_source_language == 'SV' || response.data.translations[0].detected_source_language == 'FI' || response.data.translations[0].detected_source_language == 'RU') {
                    message.channel.sendTyping();
                    message.channel.send(response.data.translations[0].text);
                } else if (response.data.translations[0].detected_source_language == 'EN') {
                    return
                }
            }
        });
    }
}