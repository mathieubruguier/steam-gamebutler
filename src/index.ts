import { Steam, SteamGame } from './steam';
import { printApplicationTitle } from './ascii';
import { Winston } from './winston';
import { Database } from './database';

printApplicationTitle();
console.log();

Database.initialize();
Steam.initialize();
Steam.acceptPendingFriendRequests();
Steam.listenForFriendshipStatusChanges();
Steam.listenForChatMessages((steamID, message) => {
    const user = Database.getUser(steamID.accountid);
    if (user) {
        // ConversationFlow.handleConversation(steamID.accountid, result.conversationState, message, db, result, function (responseString) {
        //     client.chatMessage(steamID, responseString);
        // });
        Winston.logger.debug('found user: ', steamID.accountid);
        Steam.sendChatMessage(steamID, '⏲️  Looking for requested game...');
        Steam.lookForProduct(message)
            .then((results: SteamGame[]) => {
                Steam.sendChatMessage(steamID, `Found ${results.length} games.`)
                let index = 1;
                results.forEach((game) => {
                    Steam.sendChatMessage(steamID, `${index}) ${game.name}`);
                    index++;
                });
            })
            .catch((err) => {
                Steam.sendChatMessage(steamID, 'error')
            });
    } else {
        Winston.logger.info('\u231B User doesn\'t have any info saved. Creating info and sending welcome message...');
        Database.saveUser(steamID.accountid, {
            steamId: steamID,
            conversationState: 0,
            discord: '',
            region: ''
        });
        Winston.logger.info('\u2713 Created and saved user in database');
        Steam.sendChatMessage(steamID, 'hello first time');
    }
});
