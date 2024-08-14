
const TelegramBot = require('node-telegram-bot-api');
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors'); // Added CORS support
// const axios = require('axios'); // Import axios

const token = '7254848094:AAHSL_8ZqxS0sRy8vPGZTUWIv7ZnAfPQDX4'; // Replace with your bot's token
const WEB_APP_URL = "https://staging.d2kuhkq35dk7lt.amplifyapp.com";
// const WEB_APP_URL = "https://elfintontest.gggamer.org";
const game_photo_url = 'http://ec2-18-143-141-68.ap-southeast-1.compute.amazonaws.com/bayc_photo_v2.png'; // Ensure this is correct

// const api_base_url = "https://elfintongame.gggamer.org";
// const x_api_key = "UTmNNhkgSE54G3LToyYs9aN9R7lLk931muMge9dg";
// const game_id = "000000"

const bot = new TelegramBot(token, {
    polling: {
      interval: 1000,
      autoStart: true,
      params: {
        timeout: 10
      }
    }
  });

const app = express();
app.use(cors()); // Enable CORS
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));
// const short_name = 'tggametest';

// let groupChatId = null;
// // let groupChatId = "-4236530154"; // Variable to store the group chat ID
// let leaderboard = []; // Array to store the leaderboard



// Bot command to start the game with an inline keyboard button in a private chat
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    
    if (msg.chat.type === 'private') {
        const options = {
            reply_markup: {
                inline_keyboard: [
                    [{ text: 'Play Game', web_app: { url: WEB_APP_URL }}],
                    [{ text: 'Twitter', url: 'https://x.com/BoredApeYC' }, { text: 'OpenSea', url: 'https://opensea.io/collection/boredapeyachtclub' }, { text: 'Links', url: 'https://yuga.com/links/bayc' }],
                    // [{ text: '官方中文群', url: 'https://t.me/ElfinKDMCN' }, { text: 'English Group', url: 'https://t.me/ElfinKDM' }],
                    // [{ text: 'Leaderboard', callback_data: 'leaderboard' }]
                ]
            }
        };
        bot.sendPhoto(chatId, game_photo_url, { caption: "🎮 Ready to test your skills? Join the fun and challenge your friends in this exciting game! 🏆 Click 'Play Game' to start your adventure and climb the leaderboard. Good luck! 🚀", reply_markup: options.reply_markup })
            .catch(error => {
                console.error('Error sending game photo:', error);
            });
    } else {
        bot.sendMessage(chatId, "Please start the game in a private chat.");
    }
});


// app.get('/get-tasks', async (req, res) => {
//     const userId = req.query.userId;
//     // console.log("userId: ", userId);

//     if (!userId) {
//         return res.status(400).json({ status: 'error', message: 'User ID is required' });
//     }

//     // Fetch the highest score from the external API
//     try {
//         const url = `${api_base_url}/tasklist?userId=${userId}&game=${game_id}`;

//         const response = await axios.get(url, {
//             headers: {
//                 'x-api-key': x_api_key
//             }
//         });

//         let tasks = response.data.data.Items || [];
        
//         tasks = tasks.map(item=>({
//             task: item.taskname
//         }));
//         // console.log(tasks);

//         res.json({ status: 'success', tasks: tasks });

//     } catch (error) {
//         console.error("Error fetching tasks from external API: ", error.response ? error.response.data : error.message);
//         res.status(500).json({ status: 'error', message: 'Failed to fetch tasks from external API' });
//     }
// });

// app.post('/update-tasks', async(req, res)=>{
//     const { userId, taskname, state } = req.body;

//     // console.log("Received data: ", req.body);

//     // Redirect to another API with the provided headers and body
//     try {
//         const url = `${api_base_url}/task`;

//         const response = await axios.post(url, {
//             "userId": `${userId}`,
//             "taskname": `${taskname}`,
//             "state": `${state}`,
//             "game_id": `${game_id}`
//         }, {
//             headers: {
//                 'Content-Type': 'application/json',
//                 'x-api-key': x_api_key // Replace with your actual API key
//             }
//         });

//         // console.log("Successfully posted to external API: ", response.data);
//     } catch (error) {
//         console.error("Error posting to external API: ", error.response ? error.response.data : error.message);
//     }

//     res.json({ status: 'success' });
// });

// // Endpoint to get the leaderboard
// app.get('/leaderboard', async (req, res) => {
//     try {
//         const url = `${api_base_url}/leaderboard`;
//         const response = await axios.post(url, {
//             "game_id": `${game_id}`
//         }, {
//             headers: {
//                 'Content-Type': 'application/json',
//                 'x-api-key': x_api_key
//             }
//         });

//         if (response.data.result === 1 && response.data.data.Items) {
//             const leaderboardData = response.data.data.Items.map(item => ({
//                 score: item.score,
//                 userId: item.user_id,
//                 gameTimes: item.game_times,
//                 username: item.username
//             }));

//             // console.log("Leaderboard data: ", leaderboardData);

//             res.json({ status: 'success', leaderboard: leaderboardData });
//         } else {
//             // console.log("No data found in leaderboard");
//             res.json({ status: 'success', leaderboard: [] });
//         }
//     } catch (error) {
//         console.error("Error fetching leaderboard data: ", error.response ? error.response.data : error.message);
//         res.status(500).json({ status: 'error', message: 'Failed to fetch leaderboard data' });
//     }
// });

// // Function to fetch and send the leaderboard
// async function fetchAndSendLeaderboard(chatId) {
//     try {
//         let url = `${api_base_url}/leaderboard`;
//         let response = await axios.post(url, {
//             "game_id": `${game_id}`
//         }, {
//             headers: {
//                 'Content-Type': 'application/json',
//                 'x-api-key': x_api_key
//             }
//         });

//         if (response.data.result === 1 && response.data.data.Items) {
//             const leaderboardData = response.data.data.Items.map(item => ({
//                 score: item.score,
//                 userId: item.user_id,
//                 gameTimes: item.game_times,
//                 username: item.username
//             }));

//             let leaderboardMessage = '🏆 Leaderboard 🏆\n\n';
//             leaderboardData.forEach((entry, index) => {
//                 leaderboardMessage += `${index + 1}. User: ${entry.username}, Score: ${entry.score}\n`;
//             });

//             // console.log("Leaderboard data: ", leaderboardData);
//             // bot.sendMessage(chatId, leaderboardMessage);


//             url = `${api_base_url}/me?userId=${chatId}&game=${game_id}`;

//             response = await axios.get(url, {
//                 headers: {
//                     'x-api-key': x_api_key
//                 }
//             });
    
//             const data = response.data.data;
    
//             leaderboardMessage += `\n\n`;
//             leaderboardMessage += `User: ${data.username}\nRank: ${data.rank}\nScore: ${data.score}\n`;
    
//             // console.log("Leaderboard data: ", leaderboardData);
//             bot.sendMessage(chatId, leaderboardMessage);


//         } else {
//             // console.log("No data found in leaderboard");
//             bot.sendMessage(chatId, "No data found in leaderboard.");
//         }
//     } catch (error) {
//         console.error("Error fetching leaderboard data: ", error.response ? error.response.data : error.message);
//         bot.sendMessage(chatId, "Failed to fetch leaderboard data.");
//     }

// }

// // Callback query handler for the leaderboard button
// bot.on('callback_query', async (callbackQuery) => {
//     const msg = callbackQuery.message;
//     const chatId = msg.chat.id;

//     if (callbackQuery.data === 'leaderboard') {
//         await fetchAndSendLeaderboard(chatId);
//     }
// });

// // Endpoint to get the leaderboard
// bot.onText(/\/leaderboard/, async (msg) => {
//     const chatId = msg.chat.id;

//     if (msg.chat.type === 'private'){
//         await fetchAndSendLeaderboard(chatId);
//     }else{
//         try {
//             let url = `${api_base_url}/leaderboard`;
//             let response = await axios.post(url, {
//                 "game_id": `${game_id}`
//             }, {
//                 headers: {
//                     'Content-Type': 'application/json',
//                     'x-api-key': x_api_key
//                 }
//             });
    
//             if (response.data.result === 1 && response.data.data.Items) {
//                 const leaderboardData = response.data.data.Items.map(item => ({
//                     score: item.score,
//                     userId: item.user_id,
//                     gameTimes: item.game_times,
//                     username: item.username
//                 }));
    
//                 let leaderboardMessage = '🏆 Leaderboard 🏆\n\n';
//                 leaderboardData.forEach((entry, index) => {
//                     leaderboardMessage += `${index + 1}. User: ${entry.username}, Score: ${entry.score}\n`;
//                 });
    
//                 // console.log("Leaderboard data: ", leaderboardData);
//                 bot.sendMessage(chatId, leaderboardMessage);
               
//             } else {
//                 console.log("No data found in leaderboard");
//                 bot.sendMessage(chatId, "No data found in leaderboard.");
//             }
//         } catch (error) {
//             console.error("Error fetching leaderboard data: ", error.response ? error.response.data : error.message);
//             bot.sendMessage(chatId, "Failed to fetch leaderboard data.");
//         }
//     }

   
// });

// // Endpoint to receive score submissions
// app.post('/submit-score', async (req, res) => {
//     const { userId, username, score, wallet_address } = req.body;

//     // console.log("Received data: ", req.body);

//     // Update the leaderboard
//     const existingUser = leaderboard.find(entry => entry.userId === userId);
//     if (existingUser) {
//         if (score > existingUser.score) {
//             existingUser.score = score; // Update the score if the new score is higher
//             // console.log(`Updated score for ${username} to ${score}`);
//         } else {
//             // console.log(`Score for ${username} is not updated as the new score ${score} is lower than the existing score ${existingUser.score}`);
//         }
//     } else {
//         leaderboard.push({ userId, username, score });
//         // console.log(`Added new score for ${username}: ${score}`);
//     }

//     // Forward score to the stored group chat ID
//     if (groupChatId) {
//         bot.sendMessage(groupChatId, `User ${username} achieved a score of ${score}.`);
//     }

//     // Redirect to another API with the provided headers and body
//     try {
//         const url = `${api_base_url}/upsertUser`;

//         const response = await axios.post(url, {
//             "userId": `${userId}`,
//             "game_id": `${game_id}`, // You might need to dynamically set this
//             "score": `${score}`,
//             "username": `${username}`,
//             "evmwallet": "evmwallet",
//             "tonwallet": wallet_address
//         }, {
//             headers: {
//                 'Content-Type': 'application/json',
//                 'x-api-key': x_api_key // Replace with your actual API key
//             }
//         });

//         // console.log("Successfully posted to external API: ", response.data);
//     } catch (error) {
//         console.error("Error posting to external API: ", error.response ? error.response.data : error.message);
//     }

//     res.json({ status: 'success' });
// });

// // Endpoint to get the highest score for a specific user
// app.get('/highest-score', async (req, res) => {
//     const userId = req.query.userId;
//     // console.log("userId: ", userId);

//     if (!userId) {
//         return res.status(400).json({ status: 'error', message: 'User ID is required' });
//     }

//     // Fetch the highest score from the external API
//     try {
//         const url = `${api_base_url}/me?userId=${userId}&game=${game_id}`;

//         const response = await axios.get(url, {
//             headers: {
//                 'x-api-key': x_api_key
//             }
//         });

//         const highestScore = response.data.data.score || 0;
//         const lastupdate_time = response.data.data.lastupdate_time;
//         // console.log(`Highest score for user ${userId} is ${highestScore}`);
//         res.json({ status: 'success', score: highestScore,  lastupdate_time: lastupdate_time});
//     } catch (error) {
//         console.error("Error fetching highest score from external API: ", error.response ? error.response.data : error.message);
//         // res.status(500).json({ status: 'error', message: 'Failed to fetch highest score from external API' });
//         res.json({ status: 'success', score: 0,  lastupdate_time: 0});
//     }
// });

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

bot.on('polling_error', (error) => {
    console.error(`Polling error: ${error.code} - ${error.response ? error.response.body.description : ''}`);
});

console.log('Bot is running...');