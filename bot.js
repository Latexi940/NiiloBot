const Discord = require('discord.js');
const auth = require('./auth.json');
const pubg = require('pubg.js');
const shard = 'steam'
const pubgClient = new pubg.Client(auth.pubgAPIKey, shard)

const bot = new Discord.Client({
    token: auth.token,
    autorun: true
});

let isReady = true
let isLogging = true

bot.login(auth.token)
    .catch(err => console.log(err))

bot.on('ready', () => {
    console.log('Bot connected');
});

bot.on('voiceStateUpdate', (oldState, newState) => {

    let oldChannel = oldState.channel
    let newChannel = newState.channel

    if (isLogging) {
        if (oldChannel === null && newChannel !== null) {
            console.log('Someone joined voice')
            bot.channels.cache.get(auth.logID).send(oldState.member.user.username + ' saapui voiceen')
        } else if (newChannel === null) {
            console.log('Someone left voice')
            bot.channels.cache.get(auth.logID).send(oldState.member.user.username + ' lähti voicesta')
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
    bot.channels.cache.get(auth.lobbyID).send('Tervetuloa ' + member + '!')
    bot.channels.cache.get(auth.lobbyID).send('Pistä viestiä @admin niin saatat saada oikeudet muillekkin kanaville.')
});

bot.on('message', async msg => {
        if (msg.content.substring(0, 1) === '>') {
            let args = msg.content.substring(1).split(' ');
            let cmd = args[0].toLowerCase();
            let cmdArg1 = args[1]
            let cmdArg2 = args[2]
            if (cmdArg2) {
                cmdArg2.toLowerCase()
            }

            let sender = msg.member.displayName

            console.log('Command: ' + cmd + ' from: ' + sender)
            if (isReady) {
                isReady = false
                switch (cmd) {
                    //PUBG
                    case 'pubg':
                        if (cmdArg1) {

                            let player = await pubgClient.getPlayer({name: cmdArg1})
                            let playerID = JSON.stringify(player.id).replace(/"/g, '')

                            let currentSeason = await pubgClient.getCurrentSeason()
                                .then(currentSeason => {
                                    return currentSeason
                                })
                                .catch(err => console.log(err))

                            let playerSeason = await pubgClient.getPlayerSeason(playerID, currentSeason.id, shard)
                                .then(playerSeason => {
                                    return playerSeason
                                })
                                .catch(err => console.log(err))

                            console.log('PlayerID: ' + playerID + " SeasonID: " + currentSeason.id)

                            let kills = "kills"
                            let assists = "assists"
                            let damage = "damage"
                            let wins = "wins"
                            let headshotKills = "headshotKills"
                            let longestKill = "longestKill"
                            let top10s = "top10s"
                            let modeIsValid = true

                            if (cmdArg2 === "solo") {
                                kills = playerSeason.attributes.gameModeStats.soloFPP.kills
                                assists = playerSeason.attributes.gameModeStats.soloFPP.assists
                                damage = playerSeason.attributes.gameModeStats.soloFPP.damageDealt
                                headshotKills = playerSeason.attributes.gameModeStats.soloFPP.headshotKills
                                longestKill = playerSeason.attributes.gameModeStats.soloFPP.longestKill
                                wins = playerSeason.attributes.gameModeStats.soloFPP.wins
                                top10s = playerSeason.attributes.gameModeStats.soloFPP.top10s
                            } else if (cmdArg2 === "duo") {
                                kills = playerSeason.attributes.gameModeStats.duoFPP.kills
                                assists = playerSeason.attributes.gameModeStats.duoFPP.assists
                                damage = playerSeason.attributes.gameModeStats.duoFPP.damageDealt
                                headshotKills = playerSeason.attributes.gameModeStats.duoFPP.headshotKills
                                longestKill = playerSeason.attributes.gameModeStats.duoFPP.longestKill
                                wins = playerSeason.attributes.gameModeStats.duoFPP.wins
                                top10s = playerSeason.attributes.gameModeStats.duoFPP.top10s
                            } else if (cmdArg2 === "squad") {
                                kills = playerSeason.attributes.gameModeStats.squadFPP.kills
                                assists = playerSeason.attributes.gameModeStats.squadFPP.assists
                                damage = playerSeason.attributes.gameModeStats.squadFPP.damageDealt
                                headshotKills = playerSeason.attributes.gameModeStats.squadFPP.headshotKills
                                longestKill = playerSeason.attributes.gameModeStats.squadFPP.longestKill
                                wins = playerSeason.attributes.gameModeStats.squadFPP.wins
                                top10s = playerSeason.attributes.gameModeStats.squadFPP.top10s
                            } else if (cmdArg2 === "all") {
                                kills = playerSeason.attributes.gameModeStats.squadFPP.kills + playerSeason.attributes.gameModeStats.duoFPP.kills + playerSeason.attributes.gameModeStats.soloFPP.kills
                                assists = playerSeason.attributes.gameModeStats.squadFPP.assists + playerSeason.attributes.gameModeStats.duoFPP.assists + playerSeason.attributes.gameModeStats.soloFPP.assists
                                damage = playerSeason.attributes.gameModeStats.squadFPP.damageDealt + playerSeason.attributes.gameModeStats.duoFPP.damageDealt + playerSeason.attributes.gameModeStats.soloFPP.damageDealt
                                headshotKills = playerSeason.attributes.gameModeStats.squadFPP.headshotKills + playerSeason.attributes.gameModeStats.duoFPP.headshotKills + playerSeason.attributes.gameModeStats.soloFPP.headshotKills
                                wins = playerSeason.attributes.gameModeStats.squadFPP.wins + playerSeason.attributes.gameModeStats.duoFPP.wins + playerSeason.attributes.gameModeStats.soloFPP.wins
                                top10s = playerSeason.attributes.gameModeStats.squadFPP.top10s + playerSeason.attributes.gameModeStats.duoFPP.top10s + playerSeason.attributes.gameModeStats.soloFPP.top10s

                                const soloLongest = playerSeason.attributes.gameModeStats.soloFPP.longestKill
                                const duoLongest = playerSeason.attributes.gameModeStats.duoFPP.longestKill
                                const squadLongest = playerSeason.attributes.gameModeStats.squadFPP.longestKill

                                longestKill = Math.max(soloLongest, duoLongest, squadLongest)

                            } else {
                                modeIsValid = false
                                console.log('Invalid game mode')
                                msg.channel.send('Kirjota oikea moodi!')
                                isReady = true
                            }

                            if (modeIsValid) {
                                longestKill = Math.round((longestKill + Number.EPSILON) * 100) / 100
                                msg.channel.send(cmdArg1
                                    + '\n\nVoPet: ' + wins
                                    + '\nTapot: ' + kills
                                    + '\nHeadshot-tapot: ' + headshotKills
                                    + "\nPisin tappo: " + longestKill + "m"
                                    + "\nDamage: " + damage
                                    + '\nAssistit: ' + assists
                                    + '\nTop10: ' + top10s
                                )
                                isReady = true
                            }

                        } else {
                            console.log('Invalid player name')
                            msg.channel.send('Kirjota pelaajan nimi!')
                        }
                        break;
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
                            msg.react('🍻')
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
                            msg.channel.send('Ota viinaa!')
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
                        msg.channel.send('NIILOBOT 0.3' +
                            '\n\n>niilo (kysymys)                       Niilo vastaa kysymykseen' +
                            '\n>viisaus                     Niilo kertoo elämänviisauksiaan' +
                            '\n>rate                    Niilo antaa arvosanan' +
                            '\n>poistu                      Käskee Niilon pois voicesta paasaamasta' +
                            '\n>loki                    Aloittaa tai lopettaa lokiviestien lähetyksen' +
                            '\n>help                     Näyttää nämä komennot tässä näin' +
                            '\n>pubg [pelaajan nimi] [moodi]                     Kertoo pubgin statseja meneillään olevasta seasonista.' +
                            '\n\nEsim. komento ">pubg Mehu_Mies squad" kertoo Mehumiehen tämän seasonin statsit squadissa. Kertoo vain FPP-pelien tulokset koska eihän niitä TPP-pelejä kukaan pelaa lol.' +
                            ' Valittavat moodit: solo, duo, squad ja all.' +
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
                            let rate = getRandom(2)
                            if (rate === 0) {
                                msg.member.voice.channel.join()
                                    .then(connection => connection.play('./media/mita.mp3'))
                            } else {
                                msg.member.voice.channel.join()
                                    .then(connection => connection.play('./media/mitavittua.mp3'))
                            }
                        } else {
                            msg.channel.send('Mitä vittua tää ny meinaa ' + sender + '?')
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