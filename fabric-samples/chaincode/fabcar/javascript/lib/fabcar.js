/*
 * SPDX-License-Identifier: Apache-2.0
 */

/*
 * Smart contracts for football player registrations
 *
 * There are the following functions: 
 *      1) Player initialization 
 *      2) Player creation 
 *      3) All players listing
 *      4) One player listing 
 *      5) Trasfer request 
 *      6) Transfer verification
 *      7) Transfer acceptance   
 */

'use strict';

const { Contract } = require('fabric-contract-api');

class FabCar extends Contract {

    // Network is initialized with ten players
    async initLedger(ctx) {

        console.info('============= START : Initialize Ledger, Player part ==================================');

        const players = [{
                playerName: 'Pele',
                currentTeam: 'Rops',
                currentAssociation: 'Football Association of Finland',
                newTeam: ' ',
                newAssociation: ' ',
                transferStatus: 'Accepted',
            },
            {
                playerName: 'Ronaldo',
                currentTeam: 'Sao Paulo',
                currentAssociation: 'Brazilian Football Confederation',
                newTeam: ' ',
                newAssociation: ' ',
                transferStatus: 'Accepted',
            },
            {
                playerName: 'Gazza',
                currentTeam: 'Newcastle United',
                currentAssociation: 'English Football Association',
                newTeam: ' ',
                newAssociation: ' ',
                transferStatus: 'Accepted',
            },
            {
                playerName: 'Brolin',
                currentTeam: 'GIF Sundsvall',
                currentAssociation: 'Swedish Football Association',
                newTeam: ' ',
                newAssociation: ' ',
                transferStatus: 'Accepted',
            },
            {
                playerName: 'Zidane',
                currentTeam: 'Cannes',
                currentAssociation: 'French Football Federation',
                newTeam: ' ',
                newAssociation: ' ',
                transferStatus: 'Accepted',
            },
            {
                playerName: 'Hagi',
                currentTeam: 'Real Madrid',
                currentAssociation: 'Royal Spanish Football Federation',
                newTeam: ' ',
                newAssociation: ' ',
                transferStatus: 'Accepted',
            },
            {
                playerName: 'Milla',
                currentTeam: 'Tonnerre',
                currentAssociation: 'Cameroonian Football Federation',
                newTeam: ' ',
                newAssociation: ' ',
                transferStatus: 'Accepted',
            },
            {
                playerName: 'Beckenbauer',
                currentTeam: 'Bayern Munich',
                currentAssociation: 'German Football Association',
                newTeam: ' ',
                newAssociation: ' ',
                transferStatus: 'Accepted',
            },
            {
                playerName: 'Maldini',
                currentTeam: 'AC Milan',
                currentAssociation: 'Italian Football Federation',
                newTeam: ' ',
                newAssociation: ' ',
                transferStatus: 'Accepted',
            },
            {
                playerName: 'Tolsa',
                currentTeam: 'KTP',
                currentAssociation: 'Football Association of Finland',
                newTeam: ' ',
                newAssociation: ' ',
                transferStatus: 'Accepted',
            },
        ];

        for (let i = 0; i < players.length; i++) {
            players[i].docType = 'player';
            await ctx.stub.putState('PLAYER' + i, Buffer.from(JSON.stringify(players[i])));
            console.info('Added <--> ', players[i]);
        }

        console.info('============= END : Initialize Ledger, Player part ====================================');

    }

    // Returns player info for the given player
    async queryPlayer(ctx, playerNumber) {
        const playerAsBytes = await ctx.stub.getState(playerNumber); // get the player from chaincode state
        if (!playerAsBytes || playerAsBytes.length === 0) {
            throw new Error(`${playerNumber} does not exist`);
        }
        console.log(playerAsBytes.toString());
        return playerAsBytes.toString();
    }

    // Function creates a new player 
    async createPlayer(ctx, playerNumber, playerName, currentTeam, currentAssociation) {
        console.info('============= START : Create Player ===========');

        const player = {
            playerName,
            docType: 'player',
            currentTeam,
            currentAssociation,
            newTeam: ' ',
            newAssociation: ' ',
            transferStatus: 'Accepted',
        };

        await ctx.stub.putState(playerNumber, Buffer.from(JSON.stringify(player)));
        console.info('============= END : Create Player ===========');
    }


    // Function returns infomation for all players - assumption is that there is max 1000 players
    async queryAllPlayers(ctx) {
        const startKey = 'PLAYER0';
        const endKey = 'PLAYER999';

        const iterator = await ctx.stub.getStateByRange(startKey, endKey);

        const allResults = [];
        while (true) {
            const res = await iterator.next();

            if (res.value && res.value.value.toString()) {
                console.log(res.value.value.toString('utf8'));

                const Key = res.value.key;
                let Record;
                try {
                    Record = JSON.parse(res.value.value.toString('utf8'));
                } catch (err) {
                    console.log(err);
                    Record = res.value.value.toString('utf8');
                }
                allResults.push({ Key, Record });
            }
            if (res.done) {
                console.log('end of data');
                await iterator.close();
                console.info(allResults);
                return JSON.stringify(allResults);
            }
        }
    }

    // Player has reguested for the transfer. New Team updates the status as "Requested"
    async requestTransfer(ctx, playerNumber, newTeam, newAssociation) {
        console.info('============= START : requestTransfer ===========');

        const playerAsBytes = await ctx.stub.getState(playerNumber); // get the player from chaincode state
        if (!playerAsBytes || playerAsBytes.length === 0) {
            throw new Error(`${playerNumber} does not exist`);
        }
        const player = JSON.parse(playerAsBytes.toString());

        player.newTeam = newTeam;
        player.newAssociation = newAssociation;
        player.transferStatus = 'Requested';

        await ctx.stub.putState(playerNumber, Buffer.from(JSON.stringify(player)));
        console.info('============= END : reaquestTransfer ===========');

    }

    // Current Team verifies that transfer is ok and updates the status as "Verified"
    async verifyTransfer(ctx, playerNumber) {
        console.info('============= START : verifyTransfer ===========');

        const playerAsBytes = await ctx.stub.getState(playerNumber); // get the player from chaincode state
        if (!playerAsBytes || playerAsBytes.length === 0) {
            throw new Error(`${playerNumber} does not exist`);
        }
        const player = JSON.parse(playerAsBytes.toString());

        player.transferStatus = 'Verified';

        await ctx.stub.putState(playerNumber, Buffer.from(JSON.stringify(player)));
        console.info('============= END : verifyTransfer ===========');

    }

    // Football association accepts the transfer and updates the status as "Accepted"
    async acceptTransfer(ctx, playerNumber) {
        console.info('============= START : acceptTransfer ===========');

        const playerAsBytes = await ctx.stub.getState(playerNumber); // get the player from chaincode state
        if (!playerAsBytes || playerAsBytes.length === 0) {
            throw new Error(`${playerNumber} does not exist`);
        }
        const player = JSON.parse(playerAsBytes.toString());

        player.currentTeam = player.newTeam;
        player.currentAssociation = player.newAssociation;
        player.newTeam = ' ';
        player.newAssociation = ' ';
        player.transferStatus = 'Accepted';

        await ctx.stub.putState(playerNumber, Buffer.from(JSON.stringify(player)));
        console.info('============= END : acceptTransfer ===========');

    }

}

module.exports = FabCar;