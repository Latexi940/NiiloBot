const Discord = require('discord.js');
const auth = require('./auth.json');

const bot = new Discord.Client({
    token: auth.token,
    autorun: true
});

let isReady = true
let isLogging = true
const logChannelID = '788707124858585128'
const lobbyChannelID = '632447830723788810'

bot.login(auth.token)

bot.on('ready', () => {
    console.log('Bot connected');
});

bot.on('voiceStateUpdate', (oldState, newState) => {

    let oldChannel = oldState.channel
    let newChannel = newState.channel
    // console.log('Old: '+ oldChannel)
    // console.log('New: '+ newChannel)

    if (isLogging) {
        if (oldChannel === null && newChannel !== null) {
            console.log('Someone joined voice')
            bot.channels.cache.get(logChannelID).send(oldState.member.user.username + ' saapui voiceen')
        } else if (newChannel === null) {
            console.log('Someone left voice')
            bot.channels.cache.get(logChannelID).send(oldState.member.user.username + ' lähti voicesta')
        }
    }

    if (oldState.channelID !== oldState.guild.me.voice.channelID || newState.channel) {
        return
    }
    if (oldState.channel.members.size <= 1)
        setTimeout(() => {
            if (oldState.channel.members.size <= 1) {
                oldState.channel.leave()
                console.log('Leaving voice channel')
            }
        }, 3000);
});

bot.on('guildMemberAdd', member => {
    console.log(member + 'joined server')
    bot.channels.cache.get(lobbyChannelID).send('Tervetuloa ' + member + '!')
    bot.channels.cache.get(lobbyChannelID).send('Pistä viestiä @admin niin saatat saada oikeudet muillekkin kanaville.')
});

bot.on('message', msg => {
        if (msg.content.substring(0, 1) === '>') {
            let args = msg.content.substring(1).split(' ');
            let cmd = args[0].toLowerCase();
            let sender = msg.member.displayName

            console.log('Command: ' + cmd + ' from: ' + sender)
            if (isReady) {
                isReady = false
                switch (cmd) {
                    //Voice
                    case 'poistu':
                        if (msg.member.voice.channel !== null) {
                            msg.member.voice.channel.leave()
                        } else {
                            msg.channel.send('Poistu itte ' + sender + '!')
                        }
                        isReady = true
                        break;
                    //Kohtalo
                    case 'niilo':
                        if (msg.member.voice.channel) {
                            msg.react('👍')
                            let rng = getRandom(5);
                            if (rng === 0) {
                                msg.member.voice.channel.join()
                                    .then(connection => connection.play('./media/eipaollu.mp3'))
                            }
                            if (rng === 1) {
                                msg.member.voice.channel.join()
                                    .then(connection => connection.play('./media/on.mp3'))
                            }
                            if (rng === 2) {
                                msg.member.voice.channel.join()
                                    .then(connection => connection.play('./media/eiketaankiinnosta.mp3'))
                            }
                            if (rng === 3) {
                                msg.member.voice.channel.join()
                                    .then(connection => connection.play('./media/alalaitatallasta.mp3'))
                            }

                            if (rng === 5) {
                                msg.member.voice.channel.join()
                                    .then(connection => connection.play('./media/mita.mp3'))
                            }
                        } else {
                            let rng = getRandom(4);
                            if (rng === 0) {
                                msg.channel.send('Eipä ollu!')
                            }
                            if (rng === 1) {
                                msg.channel.send('ON!')
                            }
                            if (rng === 2) {
                                msg.channel.send('Ei ketään kiinnosta.')
                            }
                            if (rng === 3) {
                                msg.channel.send('Älä laita tällästä.')
                            }
                        }
                        isReady = true
                        break;
                    //Arvostelu
                    case 'rate':
                        if (msg.member.voice.channel) {
                            msg.react('👍')
                            let rate = getRandom(2)
                            if (rate === 0) {
                                msg.member.voice.channel.join()
                                    .then(connection => connection.play('./media/nolla.mp3'))
                            } else {
                                msg.member.voice.channel.join()
                                    .then(connection => connection.play('./media/viis.mp3'))
                            }
                        } else {
                            let rate = getRandom(2)
                            if (rate === 0) {
                                msg.channel.send('Nolla kautta viis')
                            } else {
                                msg.channel.send('Viis kautta viis!')
                            }
                        }
                        isReady = true
                        break;
                    //Viisaudet
                    case 'viisaus':
                        if (msg.member.voice.channel) {
                            msg.react('👍')
                            let rng = getRandom(5);
                            if (rng === 0) {
                                msg.member.voice.channel.join()
                                    .then(connection => connection.play('./media/mummo.mp3'))
                            }
                            if (rng === 1) {
                                msg.member.voice.channel.join()
                                    .then(connection => connection.play('./media/eiainaviinaa.mp3'))
                            }
                            if (rng === 2) {
                                msg.member.voice.channel.join()
                                    .then(connection => connection.play('./media/kelloon.mp3'))
                            }
                            if (rng === 3) {
                                msg.member.voice.channel.join()
                                    .then(connection => connection.play('./media/joulu.mp3'))
                            }
                            if (rng === 4) {
                                msg.member.voice.channel.join()
                                    .then(connection => connection.play('./media/pensselit.mp3'))
                            }
                        } else {
                            let rng = getRandom(5);
                            if (rng === 0) {
                                msg.channel.send('Kahvia naamariin sano... sano mummo että... ennenku sano mummo.')
                            }
                            if (rng === 1) {
                                msg.channel.send('Ei aina kannata viinaa ottaa, mutta välillä kannattaa.')
                            }
                            if (rng === 2) {
                                msg.channel.send('Kello on nyt just sen verran mitä se on kun sä katot sitä kelloo.')
                            }
                            if (rng === 3) {
                                msg.channel.send('Vois viettää joulua ihanasti. Eikä tarviis viettää joulua niin saatanasti.')
                            }
                            if (rng === 4) {
                                msg.channel.send('Eikun pensselit heilumaan sano vanha rouva kun oli huono hetki!')
                            }
                        }
                        isReady = true
                        break;

                    //Muuta mukavaa
                    case 'loki':
                        if (isLogging) {
                            isLogging = false
                            msg.channel.send('Lokin pito lopetettu.')
                        } else {
                            isLogging = true
                            msg.channel.send('Lokin pito päällä.')
                        }
                        isReady = true
                        break;
                    case 'kalja':
                        if (msg.member.voice.channel) {
                            msg.react('👍')
                            msg.member.voice.channel.join()
                                .then(connection => connection.play('./media/kaljaviina.mp3'))
                        } else {
                            msg.channel.send('Kalja, kalja, kalja viina!')
                        }
                        isReady = true
                        break;
                    case 'selvinpäin':
                        if (msg.member.voice.channel) {
                            msg.react('👍')
                            msg.member.voice.channel.join()
                                .then(connection => connection.play('./media/mukavampaa.mp3'))
                        } else {
                            msg.channel.send('Mikä sen mukavampaa kun olla selvinpäin tietokoneella pelkästään.')
                        }
                        isReady = true
                        break;
                    case 'viina':
                        if (msg.member.voice.channel) {
                            msg.react('👍')
                            msg.member.voice.channel.join()
                                .then(connection => connection.play('./media/otaviinaa.mp3'))
                        } else {
                            msg.channel.send('Ota viinaa')
                        }
                        isReady = true
                        break;
                    case'meetöihin':
                        if (msg.member.voice.channel) {
                            msg.react('🤬')
                            msg.member.voice.channel.join()
                                .then(connection => connection.play('./media/meneitte.mp3'))
                        } else {
                            msg.channel.send('Mee itte saatana töihin ' + sender)
                        }
                        isReady = true
                        break;
                    case'syötkeksiä':
                        if (msg.member.voice.channel) {
                            msg.react('😠')
                            msg.member.voice.channel.join()
                                .then(connection => connection.play('./media/keksi.mp3'))
                        } else {
                            msg.channel.send('En oo syöny keksiä!')
                        }
                        isReady = true
                        break;
                    case 'näin':
                        if (msg.member.voice.channel) {
                            msg.react('👍')
                            let rate = getRandom(2)
                            if (rate === 0) {
                                msg.member.voice.channel.join()
                                    .then(connection => connection.play('./media/asiaonnain.mp3'))
                            } else {
                                msg.member.voice.channel.join()
                                    .then(connection => connection.play('./media/seonnain.mp3'))
                            }
                        } else {
                            msg.channel.send('Näin!')
                        }
                        isReady = true
                        break;
                    case'huijaus':
                        if (msg.member.voice.channel) {
                            msg.react('👍')
                            msg.member.voice.channel.join()
                                .then(connection => connection.play('./media/huijaus.mp3'))
                        } else {
                            msg.channel.send('Huijaus on käynnissää')
                        }
                        isReady = true
                        break;
                    case'help':
                        msg.channel.send('NIILOBOT 0.2' +
                            '\n\n>niilo (kysymys)           Niilo vastaa kysymykseen' +
                            '\n>viisaus         Niilo kertoo elämänviisauksiaan' +
                            '\n>rate         Niilo antaa arvosanan' +
                            '\n>poistu          Käskee Niilon pois voicesta paasaamasta' +
                            '\n>loki          Aloittaa tai lopettaa lokiviestien lähetyksen' +
                            '\n>help          Näyttää nämä komennot tässä näin' +
                            '\n\nMuita komentoja:' +
                            '\n>meetöihin' +
                            '\n>syötkeksiä' +
                            '\n>huijaus' +
                            '\n>näin' +
                            '\n>kalja' +
                            '\n>selvinpäin' +
                            '\n>viina'
                        )
                        isReady = true
                        break;
                    default:
                        if (msg.member.voice.channel) {
                            msg.member.voice.channel.join()
                                .then(connection => connection.play('./media/mitavittua.mp3'))
                        } else {
                            msg.channel.send('Mitä vittua tää ny meinaa ' + sender)
                        }
                        isReady = true
                        break;
                }
            }
        }
    }
);

function getRandom(i) {
    return Math.floor(Math.random() * i)
}