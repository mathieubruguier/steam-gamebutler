import { Winston } from './winston';
import { Configuration } from './config';
var SteamUser = require('steam-user');
var client = new SteamUser();
var rp = require('request-promise');
var stringSimilarity = require('string-similarity');

export interface SteamGame {
    appId: number;
    name: string;
}

export class Steam {

    public static initialize() {
        // Sign on to Steam
        Winston.logger.info('⏲️  Connecting to Steam...');
        client.logOn({
            accountName: Configuration.steamUsername,
            password: Configuration.steamPassword
        });

        client.on('error', function (e: any) {
            // Some error occurred during logon.  Enums found here: 
            // https://github.com/SteamRE/SteamKit/blob/SteamKit_1.6.3/Resources/SteamLanguage/eresult.steamd
            Winston.logger.error(e);
            process.exit(1);
        });

        client.on('loggedOn', function () {
            Winston.logger.info('✔️  Connected to Steam.');
            Winston.logger.debug('Logged into Steam as ' + client.steamID.getSteam3RenderedID());
        });

        this.checkAccountLimitations();
        this.initializeWebSession();
    }

    private static checkAccountLimitations() {
        client.on('accountLimitations', function (limited: boolean, communityBanned: boolean, locked: boolean, canInviteFriends: boolean) {
            if (limited) {
                // More info: https://support.steampowered.com/kb_article.php?ref=3330-IAGK-7663
                Winston.logger.warn('⚠️  My account is limited. I cannot send friend invites, use the market, open group chat, or access the web API.');
            }
            if (communityBanned) {
                // More info: https://support.steampowered.com/kb_article.php?ref=4312-UOJL-0835
                // http://forums.steampowered.com/forums/showpost.php?p=17054612&postcount=3
                Winston.logger.error('⛔  My account is banned from Steam Community.  ⛔');
                process.exit(1);
            }
            if (locked) {
                // Either self-locked or locked by a Valve employee: http://forums.steampowered.com/forums/showpost.php?p=17054612&postcount=3
                Winston.logger.error('⚠️  My account is locked. I cannot trade/gift/purchase items, play on VAC servers, or access Steam Community.  Shutting down.');
                process.exit(1);
            }
            if (!canInviteFriends) {
                Winston.logger.warn('⚠️  My account is unable to send friend requests.');
            }
        });
    }

    private static initializeWebSession() {
        client.on('webSession', function () {
            Winston.logger.info('😎  Setting status to online and polishing up username.')
            client.setPersona(SteamUser.Steam.EPersonaState.Online, 'The Game Butler - Gabi');
            client.gamesPlayed('Planning game sessions');
        });
    }

    public static acceptPendingFriendRequests() {
        client.on('friendsList', function () {
            Winston.logger.info('⏲️  Checking for new friend requests...');
            var friendcount = 0;

            for (let steamID in client.myFriends) {
                friendcount++;
                if (client.myFriends[steamID] === SteamUser.Steam.EFriendRelationship.RequestRecipient) {
                    Winston.logger.info('❗  Friend request while offline from: ' + steamID + '. Let\'s accept them 😗');
                    client.addFriend(steamID);
                }
            }
            Winston.logger.info('👨‍👩‍👧‍👦  I\'ve got a total of ' + friendcount + ' friends. Pretty impressive, huh. 💁‍');
            if (friendcount > 200) {
                // We might be able to find old friends after using client.friends.requestFriendData([steamids])
                // but seishun will have to add support for it. Right now you can't see how long you've been friends through SteamFriends.
                // This is the only data available using requestFriendData function: 
                // https://github.com/SteamRE/SteamKit/blob/master/Resources/Protobufs/steamclient/steammessages_clientserver.proto#L446-L469
                // Winston.logger.warn('I'm approaching the default friends limit.  Maybe we need to purge old friends?');
            }
        });
    }

    public static listenForFriendshipStatusChanges() {
        client.on('friendRelationship', function (steamID, relationship) {
            if (relationship == SteamUser.Steam.EFriendRelationship.RequestRecipient) {
                Winston.logger.info('❗  Someone [' + steamID + '] added me as a friend! Let\'s accept them.');
                client.addFriend(steamID);
            } else if (relationship == SteamUser.Steam.EFriendRelationship.None) {
                Winston.logger.info('😞  I just lost a friend [' + steamID + ']');
            }
        });
    }

    public static listenForChatMessages(callback) {
        client.on('friendMessage', function (steamID, message) {
            Winston.chatLog.info('💬  [' + steamID.accountid + ']: ' + message);
            callback(steamID, message);

        });
    }

    public static sendChatMessage(steamId, message) {
        client.chatMessage(steamId, message);
    }

    public static lookForProduct(gameTitle): Promise<any> {
        var options = {
            uri: 'http://api.steampowered.com/ISteamApps/GetAppList/v0002/?key=STEAMKEY&format=json',
            json: true // Automatically parses the JSON string in the response
        };

        return rp(options)
            .then(function (result) {
                let possibleResultList: any[] = [];
                const games: SteamGame[] = result.applist.apps;
                games.forEach(game => {
                    if (game.name.toLowerCase().indexOf(gameTitle.toLowerCase()) !== -1) {
                        possibleResultList.push(game);
                        if (possibleResultList.length >= 5) {
                            return possibleResultList;
                        }
                    }
                })
                if (possibleResultList.length === 0) {
                    Winston.logger.warn(`Couldn't find any game matching '${gameTitle}'`);
                }
                return possibleResultList;
            })
            .catch(function (err) {
                Winston.logger.error('⛔  Error fetching games list from Steam API: ' + err);
                throw err;
            });
    }
}