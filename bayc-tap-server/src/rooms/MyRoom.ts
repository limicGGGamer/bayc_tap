import { Room, Client } from "@colyseus/core";
import { MyRoomState } from "./schema/MyRoomState";
import { json } from "express";
const default_updJson = require("../json/upd_en.json");
const axios = require('axios'); // Import axios

const api_base_url = "https://elfintongame.gggamer.org";
const game_id: string = "bayc-tap";
const x_api_key: string = "UTmNNhkgSE54G3LToyYs9aN9R7lLk931muMge9dg";


let userData: any;

export class MyRoom extends Room<MyRoomState> {
  maxClients = 1;

  onCreate(options: any) {
    this.setState(new MyRoomState());

    this.onMessage("*", (client, type, message) => {
      
      console.log(type);
      switch (type) {
        case "update-data":
          console.log("update-data");
          this.updateData(message);
          break;
        case "get-leaderboard":
          console.log("get-leaderboard");
          this.getLeaderboard();
          break;
        case "get-user-data":
          console.log("get-user-data");
          this.getUserData(message);
          break;
      }
    });

  }


  async submitScore() {

    try {
      const url = `${api_base_url}/upsertUser`;

      if(userData.score <= 0)
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
    } catch (error: any) {
      console.error("Error fetching submitScore from external API: ", error.response ? error.response.data:"interal server error");
    }

    
    this.disconnect();

  }

  async updateData(message: any) {
    console.log("updateData message: ", message);
    const { userId, username, score, wallet_address, money, totalMoney, earnClick, earnSec, energy, curEnergy, curSkin } = message;

    userData = {
      "userId": `${userId}`,
      // "game_id": `${game_id}`, // You might need to dynamically set this
      "score": score,
      "username": `${username}`,
      "evmwallet": "evmwallet",
      "tonwallet": wallet_address,
      extra: {
        "money": money,
        "totalMoney": totalMoney,
        "earnClick": earnClick,
        "earnSec": earnSec,
        "energy": energy,
        "curEnergy": curEnergy,
        "curSkin": curSkin
      }
    };
  }

  async getUserData(message: any) {
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
          "money": Number(extra.money),
          "totalMoney": Number(extra.totalMoney),
          "earnClick": Number(extra.earnClick),
          "earnSec":Number( extra.earnSec),
          "energy": Number(extra.energy),
          "curEnergy": Number(extra.curEnergy),
          "curSkin": Number(extra.curSkin),
          "upd": extra.upd
        }
      };
  
      if(tonwallet == "")
        userData.extra.money = 0;

      this.broadcast('game-event', { event: 'get-user-data', result: 1, data: userData });
    } catch (error: any) {
      console.error("Error fetching get-user-data from external API: ", error.response ? error.response.data:"interal server error");
      
      this.broadcast('game-event', { 
        event: 'get-user-data', 
        data: error.response.data
      });

      if(error.response.data.message == "User not found" && tonwallet != "")
        this.createNewUser(message);
    }
  }

  async createNewUser(message: any){
    const userId = message.userId;
    const walletId = message.walletId;
    try {
      const url = `${api_base_url}/upsertUser`;

      const extra = {
        "money": 0,
        "totalMoney": 0,
        "earnClick": 1,
        "earnSec": 0,
        "energy": 3000,
        "curEnergy": 0,
        "curSkin": 0,
        "upd": default_updJson
      }
      
      const response = await axios.post(url, {
        "userId": `${userId}`,
        "game_id": `${game_id}`, // You might need to dynamically set this
        "score": 1,
        "username": "new user",
        "evmwallet": "evmwallet",
        "tonwallet": `${walletId}`,
        "extra": JSON.stringify(extra)
      }, {
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': x_api_key // Replace with your actual API key
        }
      });

      userData = response.data.data;
      this.broadcast('game-event', { event: 'get-user-data', result: 1, data: userData });

      console.log("createNewUser success!!");
    } catch (error: any) {
      console.error("Error fetching createNewUser from external API: ", error.response ? error.response.data:"interal server error");
    }
  }

  async getLeaderboard(){

    let url = `${api_base_url}/leaderboard`;
    try{
      let response = await axios.post(url, {
          "game_id": `${game_id}`
      }, {
          headers: {
              'Content-Type': 'application/json',
              'x-api-key': x_api_key
          }
      });

      if (response.data.result === 1 && response.data.data.Items) {
          const leaderboardData = response.data.data.Items.map((item: any) => ({
              score: item.score,
              userId: item.user_id,
              gameTimes: item.game_times,
              username: item.username
          }));

          // let leaderboardMessage = '🏆 Leaderboard 🏆\n\n';
          // leaderboardData.forEach((entry:any, index:any) => {
          //     leaderboardMessage += `${index + 1}. User: ${entry.username}, Score: ${entry.score}\n`;
          // });

          this.broadcast('game-event', { event: 'get-leaderboard', result: 1, data: leaderboardData });
          
      } else {
          console.log("No data found in leaderboard");
          this.broadcast('game-event', { event: 'get-leaderboard', result: 1, data: [] });
      }
      console.log("updateLeaderboard success!!");
    } catch (error: any) {
      console.error("Error fetching getLeaderboard from external API: ", error.response ? error.response.data:"interal server error");
    }
  }

  onJoin(client: Client, options: any) {
    console.log(client.sessionId, "joined!");
  }

  onLeave(client: Client, consented: boolean) {
    console.log(client.sessionId, "left!");
    if(userData)
      this.submitScore();
  }

  onDispose() {
    console.log("room", this.roomId, "disposing...");
  }

}
