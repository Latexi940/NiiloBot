const Discord = require('discord.js');
const auth = require('./auth.json');
const pubg = require('pubg.js');
const shard = 'steam'
const pubgClient = new pubg.Client(auth.pubgAPIKey, shard)
let logChannelID = ""
let lobbyChannelID = ""

const bot = new Discord.Client({
    token: auth.token,
    autorun: true
});

let isReady = true
let isLogging = false

bot.login(auth.token)
    .catch(err => console.log(err))

bot.on('ready', async () => {
    console.log('Bot connected');
});

bot.on('voiceStateUpdate', (oldState, newState) => {

    let oldChannel = oldState.channel
    let newChannel = newState.channel

    if (isLogging) {
        if (oldChannel === null && newChannel !== null) {
            console.log(oldState.member.user.username + ' joined voice')
            bot.channels.cache.get(logChannelID).send(oldState.member.user.username + ' saapui voiceen')
        } else if (newChannel === null) {
            console.log(oldState.member.user.username + ' left voice')
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
    if (lobbyChannelID) {
        console.log(member.displayName + ' joined server')
        bot.channels.cache.get(lobbyChannelID).send('Tervetuloa ' + member.displayName + '!')
        bot.channels.cache.get(lobbyChannelID).send('Pistä viestiä @admin niin saatat saada oikeudet muillekkin kanaville.')
    } else {
        console.log('No lobby channel set')
    }
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

            console.log('Command: ' + cmd + ' ' + cmdArg1 + ' ' + cmdArg2 + ' from: ' + sender + '. isReady=' + isReady)
            if (isReady) {
                isReady = false
                switch (cmd) {
                    case 'pubg':
                        if (cmdArg1) {
                            let isPrintable = true
                            let player = await pubgClient.getPlayer({name: cmdArg1})
                                .then(player => {
                                    return player
                                })
                                .catch(err => {
                                    console.log('Error getting player: ' + err.message)
                                    if (err.status === 429) {
                                        msg.channel.send('Odotas ny hetki ja koita sit uusiks!')
                                    }
                                    if (err.status === 404) {
                                        msg.channel.send('Eipä ollukkaan semmosta pelaajaa olemassa ollenkaan!')
                                    }
                                })

                            if (player) {
                                let playerID = JSON.stringify(player.id).replace(/"/g, '')

                                await pubgClient.getPlayerLifetime(playerID, shard)
                                    .then(playerLifetime => {
                                        let soloStats = playerLifetime.attributes.gameModeStats.soloFPP
                                        let duoStats = playerLifetime.attributes.gameModeStats.duoFPP
                                        let squadStats = playerLifetime.attributes.gameModeStats.squadFPP

                                        let rounds = "rounds"
                                        let kills = "kills"
                                        let assists = "assists"
                                        let damage = "damage"
                                        let wins = "wins"
                                        let headshotKills = "headshotKills"
                                        let longestKill = "longestKill"
                                        let top10s = "top10s"
                                        let dailyKills = "dailyKills"
                                        let dailyWins = "dailyWins"
                                        let weekylKills = "weeklyKills"
                                        let weekylWins = "weekylWins"

                                        if (cmdArg2 === "solo") {
                                            rounds = soloStats.roundsPlayed
                                            kills = soloStats.kills
                                            assists = soloStats.assists
                                            damage = soloStats.damageDealt
                                            headshotKills = soloStats.headshotKills
                                            longestKill = soloStats.longestKill
                                            wins = soloStats.wins
                                            top10s = soloStats.top10s
                                        } else if (cmdArg2 === "duo") {
                                            rounds = duoStats.roundsPlayed
                                            kills = duoStats.kills
                                            assists = duoStats.assists
                                            damage = duoStats.damageDealt
                                            headshotKills = duoStats.headshotKills
                                            longestKill = duoStats.longestKill
                                            wins = duoStats.wins
                                            top10s = duoStats.top10s
                                        } else if (cmdArg2 === "squad") {
                                            rounds = squadStats.roundsPlayed
                                            kills = squadStats.kills
                                            assists = squadStats.assists
                                            damage = squadStats.damageDealt
                                            headshotKills = squadStats.headshotKills
                                            longestKill = squadStats.longestKill
                                            wins = squadStats.wins
                                            top10s = squadStats.top10s
                                        } else if (cmdArg2 === "last") {
                                            isPrintable = false
                                            dailyKills = soloStats.dailyKills + duoStats.dailyKills + squadStats.dailyKills
                                            dailyWins = soloStats.dailyWins + duoStats.dailyWins + squadStats.dailyWins
                                            weekylKills = soloStats.weeklyKills + duoStats.weeklyKills + squadStats.weeklyKills
                                            weekylWins = soloStats.weeklyWins + duoStats.weeklyWins + squadStats.weeklyWins

                                            console.log('Fetched last weeks data for ' + cmdArg1)

                                            msg.channel.send(cmdArg1
                                                + '\n\nPäivän tapot: ' + dailyKills
                                                + '\nPäivän voitot: ' + dailyWins
                                                + '\nViikon tapot: ' + weekylKills
                                                + '\nViikon voitot: ' + weekylWins
                                            )
                                        } else if (!cmdArg2) {
                                            rounds = squadStats.roundsPlayed + duoStats.roundsPlayed + soloStats.roundsPlayed
                                            kills = squadStats.kills + duoStats.kills + soloStats.kills
                                            assists = squadStats.assists + duoStats.assists + soloStats.assists
                                            damage = squadStats.damageDealt + duoStats.damageDealt + soloStats.damageDealt
                                            headshotKills = squadStats.headshotKills + duoStats.headshotKills + soloStats.headshotKills
                                            wins = squadStats.wins + duoStats.wins + soloStats.wins
                                            top10s = squadStats.top10s + duoStats.top10s + soloStats.top10s

                                            const soloLongest = playerLifetime.attributes.gameModeStats.soloFPP.longestKill
                                            const duoLongest = playerLifetime.attributes.gameModeStats.duoFPP.longestKill
                                            const squadLongest = playerLifetime.attributes.gameModeStats.squadFPP.longestKill

                                            longestKill = Math.max(soloLongest, duoLongest, squadLongest)
                                        } else {
                                            isPrintable = false
                                            console.log('Invalid mode')
                                            msg.channel.send('Mitä?')
                                        }

                                        if (isPrintable) {
                                            longestKill = Math.round((longestKill + Number.EPSILON) * 100) / 100
                                            damage = Math.round((damage + Number.EPSILON) * 100) / 100
                                            console.log('Fetched data for ' + cmdArg1)
                                            msg.channel.send(cmdArg1
                                                + '\n\nPelit: ' + rounds
                                                + '\nVoPet: ' + wins
                                                + '\nTapot: ' + kills
                                                + '\nHeadshot-tapot: ' + headshotKills
                                                + "\nPisin tappo: " + longestKill + "m"
                                                + "\nDamage: " + damage
                                                + '\nAssistit: ' + assists
                                                + '\nTop10: ' + top10s)
                                        }
                                    })
                                    .catch(err => {
                                        console.log('Error getting player stats: ' + err.message)
                                        msg.channel.send('Nyt hajos jotain taas.')
                                        isReady = true
                                    })
                            } else {
                                console.log('Player is null')
                                isReady = true
                            }
                        } else {
                            console.log('Invalid player name')
                            msg.channel.send('Kirjotas ny joku pelaajanimi siihe perään')
                        }
                        isReady = true
                        break;
                    //Voice
                    case'poistu':
                        if (msg.member.voice.channel !== null) {
                            msg.member.voice.channel.leave()
                        } else {
                            msg.channel.send('Poistu itte ' + sender + '!')
                        }
                        isReady = true
                        break;
                    //Kohtalo
                    case'niilo':
                        if (msg.member.voice.channel) {
                            msg.react('👍')
                            let rng = getRandom(4);
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
                    case'rate':
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
                    case'viisaus':
                        if (msg.member.voice.channel) {
                            msg.react('👍')
                            let rng = getRandom(6);
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
                                    .then(connection => connection.play('./media/koittakaajaksaa.mp3'))
                            }
                            if (rng === 3) {
                                msg.member.voice.channel.join()
                                    .then(connection => connection.play('./media/joulu.mp3'))
                            }
                            if (rng === 4) {
                                msg.member.voice.channel.join()
                                    .then(connection => connection.play('./media/pensselit.mp3'))
                            }
                            if (rng === 5) {
                                msg.member.voice.channel.join()
                                    .then(connection => connection.play('./media/kelloon.mp3'))
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
                    case'loki':
                        if (!cmdArg1) {
                            if (logChannelID) {
                                if (isLogging) {
                                    isLogging = false
                                    msg.channel.send('Lokin kirjaus lopetettu.')
                                } else {
                                    isLogging = true
                                    msg.channel.send('Lokin kirjaus käynnistetty.')
                                }
                            } else {
                                console.log('Log channel is null')
                                console.log(cmdArg1)
                                msg.channel.send('Aseta ensin lokikanava komennolla >loki set')
                            }
                        } else if (cmdArg1 === "set") {
                            isLogging = true
                            logChannelID = msg.channel.id
                            console.log('Log channelID set to: ' + logChannelID)
                            msg.channel.send('Tää on nyt lokikanava.')
                        } else {
                            msg.channel.send('Mitäs ihmettä?')
                        }
                        isReady = true
                        break;
                    case'lobby':
                        lobbyChannelID = msg.channel.id
                        console.log('Lobby channelID set to: ' + lobbyChannelID)
                        msg.channel.send('Tää on nyt lobbykanava.')
                        isReady = true
                        break;
                    case'kalja':
                        if (msg.member.voice.channel) {
                            msg.react('🍻')
                            msg.member.voice.channel.join()
                                .then(connection => connection.play('./media/kaljaviina.mp3'))
                        } else {
                            msg.channel.send('Kalja, kalja, kalja viina!')
                        }
                        isReady = true
                        break;
                    case'selvinpäin':
                        if (msg.member.voice.channel) {
                            msg.react('👍')
                            msg.member.voice.channel.join()
                                .then(connection => connection.play('./media/mukavampaa.mp3'))
                        } else {
                            msg.channel.send('Mikä sen mukavampaa kun olla selvinpäin tietokoneella pelkästään.')
                        }
                        isReady = true
                        break;
                    case'viina':
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
                    case'näin':
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
                        msg.channel.send('NIILOBOT 0.3.2' +
                            '\n\n>niilo                      Niilo vastaa kysymykseen' +
                            '\n>viisaus                     Niilo kertoo elämänviisauksiaan' +
                            '\n>rate                    Niilo antaa arvosanan' +
                            '\n>poistu                      Käskee Niilon pois voicesta paasaamasta' +
                            '\n>loki [set]                   Aloittaa tai lopettaa lokiviestien lähetyksen. Lisäkomennolla set voi asettaa kanavan, jollekka lokiviestit lähetetään.' +
                            '\n>lobby                       Asettaa lobbykanavan.' +
                            '\n>help                     Näyttää nämä komennot tässä näin' +
                            '\n>pubg [pelaajan nimi] [mode]                     Kertoo pubgin statseja meneillään olevasta seasonista.' +
                            '\n\nEsim. komento ">pubg Mehu_Mies squad" kertoo Mehumiehen tämän seasonin statsit squadissa. Kertoo vain FPP-pelien tulokset koska eihän niitä TPP-pelejä kukaan pelaa lol.' +
                            ' Valittavat modet: solo, duo, squad ja last. Jos moden jättää tyhjäksi, palautetaan kaikkien pelimuotojen yhteenlasketut tiedot.' +
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
)
;

function getRandom(i) {
    return Math.floor(Math.random() * i)
}