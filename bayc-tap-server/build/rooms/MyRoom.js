"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MyRoom = void 0;
const core_1 = require("@colyseus/core");
const MyRoomState_1 = require("./schema/MyRoomState");
const axios = require('axios'); // Import axios
const api_base_url = "https://elfintongame.gggamer.org";
const leaderboard = []; // Array to store the leaderboard
const game_id = "bayc-tap";
const x_api_key = "UTmNNhkgSE54G3LToyYs9aN9R7lLk931muMge9dg";
let userData;
class MyRoom extends core_1.Room {
    constructor() {
        super(...arguments);
        this.maxClients = 1;
    }
    onCreate(options) {
        this.setState(new MyRoomState_1.MyRoomState());
        this.onMessage("*", (client, type, message) => {
            switch (type) {
                case "submit-score":
                    console.log("submit-score");
                    this.submitScore(message);
                    break;
                case "get-user-data":
                    console.log("get-user-data");
                    this.getUserData(message);
                    break;
            }
        });
    }
    async submitScore(message) {
        console.log("submit-score message: ", message);
        const { userId, username, score, wallet_address, money, totalMoney, earnClick, earnSec, energy, curEnergy, curSkin } = message;
        userData = {
            "userId": `${userId}`,
            // "game_id": `${game_id}`, // You might need to dynamically set this
            "score": `${score}`,
            "username": `${username}`,
            "evmwallet": "evmwallet",
            "tonwallet": wallet_address,
            extra: {
                "money": `${money}`,
                "totalMoney": `${totalMoney}`,
                "earnClick": `${earnClick}`,
                "earnSec": `${earnSec}`,
                "energy": `${energy}`,
                "curEnergy": `${curEnergy}`,
                "curSkin": `${curSkin}`,
            }
        };
        try {
            const url = `${api_base_url}/upsertUser`;
            if (userData.score <= 0)
                userData.score = 1;
            console.log("upsertUser userData: ", userData);
            const response = await axios.post(url, {
                "userId": `${userData.userId}`,
                "game_id": `${game_id}`, // You might need to dynamically set this
                "score": userData.score,
                "username": `${userData.username}`,
                "evmwallet": "evmwallet",
                "tonwallet": userData.tonwallet,
                "extra": JSON.stringify(userData.extra)
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': x_api_key // Replace with your actual API key
                }
            });
            console.log("upsertUser success!!");
        }
        catch (error) {
            console.error("Error fetching get-user-data from external API: ", error.response ? error.response.data : "interal server error");
        }
    }
    // async upsertUser() {
    //   try {
    //     const url = `${api_base_url}/upsertUser`;
    //     if(userData.score <= 0)
    //       userData.score = 1;
    //     console.log("upsertUser userData: ", userData);
    //     const response = await axios.post(url, {
    //       "userId": `${userData.userId}`,
    //       "game_id": `${game_id}`, // You might need to dynamically set this
    //       "score": userData.score,
    //       "username": `${userData.username}`,
    //       "evmwallet": "evmwallet",
    //       "tonwallet": userData.tonwallet,
    //       "extra": JSON.stringify(userData.extra)
    //     }, {
    //       headers: {
    //         'Content-Type': 'application/json',
    //         'x-api-key': x_api_key // Replace with your actual API key
    //       }
    //     });
    //     console.log("upsertUser success!!");
    //   } catch (error) {
    //     console.error("Error fetching get-user-data from external API: ", error.response ? error.response.data:"interal server error");
    //   }
    // }
    async getUserData(message) {
        const url = `${api_base_url}/me?userId=${message.userId}&game=${game_id}`;
        console.log("getUserData message: ", message);
        const tonwallet = message.walletId;
        try {
            const response = await axios.get(url, {
                headers: {
                    'x-api-key': x_api_key
                }
            });
            console.log("get-user-data response: ", response.data);
            console.log("tonwallet: ", tonwallet);
            const data = response.data.data;
            const extra = JSON.parse(data.extra);
            userData = {
                "userId": `${data.userId}`,
                "score": 0,
                "username": `${data.username}`,
                "evmwallet": "evmwallet",
                "tonwallet": tonwallet,
                extra: {
                    "money": extra.money,
                    "totalMoney": extra.totalMoney,
                    "earnClick": extra.earnClick,
                    "earnSec": extra.earnSec,
                    "energy": extra.energy,
                    "curEnergy": extra.curEnergy,
                    "curSkin": extra.curSkin,
                }
            };
            if (tonwallet == "")
                userData.extra.money = 0;
            this.broadcast('game-event', { event: 'get-user-data', result: 1, data: userData });
        }
        catch (error) {
            console.error("Error fetching get-user-data from external API: ", error.response ? error.response.data : "interal server error");
            this.broadcast('game-event', {
                event: 'get-user-data',
                data: error.response.data
            });
        }
    }
    onJoin(client, options) {
        console.log(client.sessionId, "joined!");
    }
    onLeave(client, consented) {
        console.log(client.sessionId, "left!");
        // if (userData)
        //   this.upsertUser();
    }
    onDispose() {
        console.log("room", this.roomId, "disposing...");
    }
}
exports.MyRoom = MyRoom;
