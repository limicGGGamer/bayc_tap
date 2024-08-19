"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MyRoom = void 0;
const core_1 = require("@colyseus/core");
const MyRoomState_1 = require("./schema/MyRoomState");
const default_updJson = require("./json/upd_en.json");
const axios = require('axios'); // Import axios
const api_base_url = "https://elfintongame.gggamer.org";
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
                case "update-data":
                    // console.log("update-data message: ",message);
                    this.updateData(message);
                    break;
                case "get-leaderboard":
                    console.log("get-leaderboard");
                    this.getLeaderboard(message);
                    break;
                case "get-user-data":
                    // console.log("get-user-data");
                    this.getUserData(message);
                    break;
                case "update-upgrade-data":
                    // console.log("update-upgrade-data");
                    this.updateUpgradeData(message);
                    break;
                case "get-upgrade-data":
                    // console.log("get-upgrade-data");
                    this.getUpgradeData(message);
                    break;
            }
        });
    }
    async submitScore() {
        if (userData.tonwallet == '') {
            this.disconnect();
            return;
        }
        try {
            const url = `${api_base_url}/upsertUser`;
            if (userData.score <= 0)
                userData.score = 1;
            console.log("userData: ", userData);
            const response = await axios.post(url, {
                "userId": `${userData.userId}`,
                "game_id": `${game_id}`, // You might need to dynamically set this
                "score": userData.score,
                "username": `${userData.username}`,
                "evmwallet": "evmwallet",
                "tonwallet": userData.tonwallet,
                "extra": userData.extra,
                "region": `${userData.region}`
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': x_api_key // Replace with your actual API key
                }
            });
            // console.log("response: ",response.data);
            console.log("upsertUser success!!");
        }
        catch (error) {
            console.error("Error fetching submitScore from external API: ", error.response ? error.response.data : "interal server error");
        }
        this.disconnect();
    }
    updateData(message) {
        const { userId, username, score, wallet_address, money, totalMoney, earnClick, earnSec, energy, curEnergy, curSkin, isFollowChannel, lastUpdateTime, lastPlayDate, region } = message;
        const extra = {
            "money": money,
            "totalMoney": totalMoney,
            "earnClick": earnClick,
            "earnSec": earnSec,
            "energy": energy,
            "curEnergy": curEnergy,
            "curSkin": curSkin,
            "isFollowChannel": isFollowChannel,
            "lastUpdateTime": lastUpdateTime,
            "lastPlayDate": lastPlayDate
        };
        // console.log("region: ", region);
        userData = {
            "userId": `${userId}`,
            "score": score,
            "username": `${username}`,
            "evmwallet": "evmwallet",
            "tonwallet": wallet_address,
            "extra": JSON.stringify(extra),
            "region": `${region}`
        };
    }
    async getUserData(message) {
        const url = `${api_base_url}/me?userId=${message.userId}&game=${game_id}`;
        // console.log("getUserData message: ", message);
        const tonwallet = message.walletId;
        const curDate = message.curDate;
        const region = message.region;
        // console.log("get-user-data curDate: ", curDate);
        try {
            const response = await axios.get(url, {
                headers: {
                    'x-api-key': x_api_key
                }
            });
            // console.log("get-user-data response: ", response.data);
            let data = response.data.data;
            let extra = JSON.parse(data.extra);
            if (extra.lastPlayDate != curDate) {
                extra.energy = 3000;
                extra.curEnergy = 3000;
                extra.lastPlayDate = curDate;
                data.extra = JSON.stringify(extra);
                // console.log("get-user-data data.extra: ", data.extra);
            }
            userData = {
                "userId": `${data.userId}`,
                "score": 0,
                "username": `${data.username}`,
                "evmwallet": "evmwallet",
                "tonwallet": tonwallet,
                "extra": data.extra,
                "region": `${data.region}`
            };
            console.log("success get-user-data : ", userData);
            this.broadcast('game-event', { event: 'get-user-data', result: 1, data: userData });
        }
        catch (error) {
            const msg = error.response ? error.response.data : "interal server error";
            console.error("Error fetching get-user-data from external API: ", msg);
            this.broadcast('game-event', {
                event: 'get-user-data',
                data: msg
            });
            if (error.response.data.message == "User not found" && tonwallet != "")
                this.createNewUser(message);
        }
    }
    async createNewUser(message) {
        const userId = message.userId;
        const walletId = message.walletId;
        const region = message.region;
        try {
            const url = `${api_base_url}/upsertUser`;
            const curData = new Date().toLocaleString('en', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
            });
            const extra = {
                "money": 0,
                "totalMoney": 0,
                "earnClick": 1,
                "earnSec": 0,
                "energy": 3000,
                "curEnergy": 3000,
                "curSkin": 0,
                "isFollowChannel": 0,
                "lastUpdateTime": Date.now(),
                "lastPlayDate": curData
            };
            const response = await axios.post(url, {
                "userId": `${userId}`,
                "game_id": `${game_id}`, // You might need to dynamically set this
                "score": 1,
                "username": "new user",
                "evmwallet": "evmwallet",
                "tonwallet": `${walletId}`,
                "extra": extra,
                "region": region
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': x_api_key // Replace with your actual API key
                }
            });
            userData = response.data.data;
            this.broadcast('game-event', { event: 'get-user-data', result: 1, data: userData });
            const msg = {
                "userId": `${userId}`,
                "extra": ""
            };
            this.updateUpgradeData(msg);
            console.log("createNewUser success!!");
        }
        catch (error) {
            console.error("Error fetching createNewUser from external API: ", error.response ? error.response.data : "interal server error");
        }
    }
    async updateUpgradeData(message) {
        const { userId, extra } = message;
        try {
            const url = `${api_base_url}/task`;
            let extraData = extra;
            if (extra == "")
                extraData = JSON.stringify(default_updJson);
            const response = await axios.post(url, {
                "userId": `${userId}`,
                "game_id": `${game_id}`, // You might need to dynamically set this
                "state": 1,
                "taskname": "get-upgrade-data",
                "extra": extraData
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': x_api_key // Replace with your actual API key
                }
            });
            console.log("success updateUpgradeData response.data.data: ", response.data.data);
            // this.broadcast('game-event', { event: 'get-upgrade-data', result: 1, data: response.data.data });
        }
        catch (error) {
            console.error("Error fetching updateUpgradeData from external API: ", error.response ? error.response.data : "interal server error");
        }
    }
    async getUpgradeData(message) {
        const { userId } = message;
        try {
            const url = `${api_base_url}/tasklist?userId=${userId}&game=${game_id}`;
            const response = await axios.get(url, {
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': x_api_key // Replace with your actual API key
                }
            });
            console.log("success getUpgradeData response.data: ", response.data);
            // console.log("getUpgradeData response.data.data.Items.length: ",response.data.data.Items.length);
            if (response.data.data.Items.length == 0) {
                const msg = {
                    "userId": userId,
                    "extra": ""
                };
                this.updateUpgradeData(msg);
            }
            else
                this.broadcast('game-event', { event: 'get-upgrade-data', result: 1, data: response.data.data.Items[0] });
        }
        catch (error) {
            console.error("Error fetching getUpgradeData from external API: ", error.response ? error.response.data : "interal server error");
        }
    }
    async getLeaderboard(message) {
        const region = message.region;
        let url = `${api_base_url}/leaderboard`;
        try {
            let response = await axios.post(url, {
                "game_id": `${game_id}`,
                "region": `${region}`
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': x_api_key
                }
            });
            if (response.data.result === 1 && response.data.data.Items) {
                const leaderboardData = response.data.data.Items.map((item) => ({
                    score: item.score,
                    userId: item.user_id,
                    gameTimes: item.game_times,
                    username: item.username
                }));
                this.broadcast('game-event', { event: 'get-leaderboard', result: 1, data: leaderboardData });
            }
            else {
                console.log("No data found in leaderboard");
                this.broadcast('game-event', { event: 'get-leaderboard', result: 1, data: [] });
            }
            console.log("updateLeaderboard success!!");
        }
        catch (error) {
            console.error("Error fetching getLeaderboard from external API: ", error.response ? error.response.data : "interal server error");
        }
    }
    onJoin(client, options) {
        console.log(client.sessionId, "joined!");
    }
    onLeave(client, consented) {
        console.log(client.sessionId, "left!");
        if (userData)
            this.submitScore();
    }
    onDispose() {
        console.log("room", this.roomId, "disposing...");
    }
}
exports.MyRoom = MyRoom;
