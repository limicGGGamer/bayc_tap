
const TelegramBot = require('node-telegram-bot-api');
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors'); // Added CORS support
// const https = require('https');

const token = '7254848094:AAHSL_8ZqxS0sRy8vPGZTUWIv7ZnAfPQDX4'; // Replace with your bot's token
// const providerToken = ' 284685063:TEST:MzI3OTQxZjRlZGNj';

// const WEB_APP_URL = "https://staging.d2kuhkq35dk7lt.amplifyapp.com";
const WEB_APP_URL = "https://dev.d2kuhkq35dk7lt.amplifyapp.com/";
const game_photo_url = 'http://ec2-18-143-141-68.ap-southeast-1.compute.amazonaws.com/bayc_photo_v2.png'; // Ensure this is correct

const bot = new TelegramBot(token, { polling: true });

const app = express();
app.use(cors()); // Enable CORS
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// // Sample product information
// const productTitle = 'Awesome Product';
// const productDescription = 'Awesome Product'.substring(0, 32);;
// const productPrice = 1000; // 10.00 USD in cents (Telegram expects prices in the smallest currency unit)
// const currency = 'USD';

// Bot command to start the game with an inline keyboard button in a private chat
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    console.log("start bot chatId: ", chatId)

    if (msg.chat.type === 'private') {
        const options = {
            reply_markup: {
                inline_keyboard: [
                    [{ text: 'Play Game', web_app: { url: WEB_APP_URL } }],
                    [{ text: 'Twitter', url: 'https://x.com/BoredApeYC' }, { text: 'OpenSea', url: 'https://opensea.io/collection/boredapeyachtclub' }, { text: 'Links', url: 'https://yuga.com/links/bayc' }],
                    // [{ text: 'Buy Product', switch_inline_query: 'buy' }]
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

// // Handler for inline query
// bot.on('inline_query', (query) => {
//     console.log("Received inline query:", query);
//     const inlineQueryId = query.id;
    
//     const inlineQueryResult = {
//         type: 'article',
//         id: 'invoice1',
//         title: 'Buy ' + productTitle,
//         description: 'Click to get an invoice for ' + productTitle,
//         input_message_content: {
//             message_text: `Would you like to buy ${productTitle} for ${productPrice/100} ${currency}?`,
//             parse_mode: 'Markdown'
//         },
//         reply_markup: {
//             inline_keyboard: [[
//                 { text: 'Buy Now', callback_data: 'buy_product' }
//             ]]
//         }
//     };

//     bot.answerInlineQuery(inlineQueryId, [inlineQueryResult], {
//         cache_time: 0
//     }).then(() => {
//         console.log('Successfully answered inline query');
//     }).catch(error => {
//         console.error('Error answering inline query:', error);
//     });
// });

// // Handle callback queries
// bot.on('callback_query', async (callbackQuery) => {
//     console.log("Received callback query:", JSON.stringify(callbackQuery, null, 2));
//     const chatId = callbackQuery.from.id;

//     if (callbackQuery.data === 'buy_product') {
//         try {
//             const prices = JSON.stringify([{ 
//                 label: productTitle, 
//                 amount: productPrice 
//             }]);

//             console.log('Attempting to send invoice with the following details:');
//             console.log('Chat ID:', chatId);
//             console.log('Product Title:', productTitle);
//             console.log('Product Description:', productDescription);
//             console.log('Provider Token:', providerToken.trim());
//             console.log('Currency:', currency);
//             console.log('Prices:', prices);

//             const postData = new URLSearchParams({
//                 chat_id: chatId,
//                 title: productTitle,
//                 description: productDescription,
//                 payload: callbackQuery.id,
//                 provider_token: providerToken.trim(),
//                 start_parameter: 'start_param',
//                 currency: currency,
//                 prices: prices
//             }).toString();

//             const options = {
//                 hostname: 'api.telegram.org',
//                 port: 443,
//                 path: `/bot${token}/sendInvoice`,
//                 method: 'POST',
//                 headers: {
//                     'Content-Type': 'application/x-www-form-urlencoded',
//                     'Content-Length': postData.length
//                 }
//             };

//             const req = https.request(options, (res) => {
//                 let data = '';
//                 res.on('data', (chunk) => {
//                     data += chunk;
//                 });
//                 res.on('end', async () => {
//                     const result = JSON.parse(data);
//                     if (result.ok) {
//                         console.log('Invoice sent successfully:', JSON.stringify(result, null, 2));
//                         await bot.answerCallbackQuery(callbackQuery.id, { text: "Invoice sent! Check your chat." });
//                     } else {
//                         console.error('Error response from Telegram API:', data);
//                         await bot.answerCallbackQuery(callbackQuery.id, { text: "Error sending invoice. Please try again." });
//                     }
//                 });
//             });

//             req.on('error', async (error) => {
//                 console.error('Error sending invoice:', error);
//                 await bot.answerCallbackQuery(callbackQuery.id, { text: "Error sending invoice. Please try again." });
//             });

//             req.write(postData);
//             req.end();

//         } catch (error) {
//             console.error('Error in callback query handler:', error);
//             await bot.answerCallbackQuery(callbackQuery.id, { text: "An error occurred. Please try again." });
//         }
//     } else {
//         try {
//             await bot.answerCallbackQuery(callbackQuery.id, { text: "Unknown action" });
//         } catch (error) {
//             console.error('Error answering callback query:', error);
//         }
//     }
// });

// app.post('/api/transaction', async (req, res) => {
//     const { userId, itemId, itemName, itemPrice } = req.body;

//     if (!userId || !itemId || !itemName || !itemPrice) {
//         return res.status(400).json({ error: 'Missing required parameters' });
//     }

//     try {
//         const prices = JSON.stringify([{ 
//             label: itemName, 
//             amount: Math.round(itemPrice * 100) // Convert to cents
//         }]);

//         const postData = new URLSearchParams({
//             chat_id: userId,
//             title: `Purchase ${itemName}`,
//             description: `Buy ${itemName} for your game`,
//             payload: `game_purchase_${itemId}`,
//             provider_token: providerToken.trim(),
//             start_parameter: 'game_purchase',
//             currency: 'USD',
//             prices: prices
//         }).toString();

//         const options = {
//             hostname: 'api.telegram.org',
//             port: 443,
//             path: `/bot${token}/sendInvoice`,
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/x-www-form-urlencoded',
//                 'Content-Length': postData.length
//             }
//         };

//         const request = https.request(options, (response) => {
//             let data = '';
//             response.on('data', (chunk) => {
//                 data += chunk;
//             });
//             response.on('end', () => {
//                 const result = JSON.parse(data);
//                 if (result.ok) {
//                     res.json({ success: true, message: 'Invoice sent successfully' });
//                 } else {
//                     res.status(500).json({ error: 'Failed to send invoice', details: result });
//                 }
//             });
//         });

//         request.on('error', (error) => {
//             console.error('Error sending invoice:', error);
//             res.status(500).json({ error: 'Internal server error' });
//         });

//         request.write(postData);
//         request.end();

//     } catch (error) {
//         console.error('Error processing transaction:', error);
//         res.status(500).json({ error: 'Internal server error' });
//     }
// });

// // Add this at the end of your file
// bot.on('polling_error', (error) => {
//     console.error('Polling error:', error);
// });

// process.on('uncaughtException', (error) => {
//     console.error('Uncaught Exception:', error);
// });

// process.on('unhandledRejection', (reason, promise) => {
//     console.error('Unhandled Rejection at:', promise, 'reason:', reason);
// });

// // Handle the pre-checkout query
// bot.on('pre_checkout_query', (query) => {
//     console.log("pre_checkout_query");
//     bot.answerPreCheckoutQuery(query.id, true).catch(error => {
//         console.error('Error answering pre-checkout query:', error);
//     });
// });

// // Handle successful payment
// bot.on('successful_payment', (msg) => {
//     const chatId = msg.chat.id;
//     const payload = msg.successful_payment.invoice_payload;
//     const [type, itemId] = payload.split('_');
    
//     if (type === 'game' && itemId) {
//         // Here you would typically update your game's database to reflect the purchase
//         bot.sendMessage(chatId, `Congratulations! Your purchase of item ${itemId} was successful. The item has been added to your game inventory.`);
//         // You might want to trigger an event or API call to your game server here
//     }
// });

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

// bot.on('polling_error', (error) => {
//     console.error(`Polling error: ${error.code} - ${error.response ? error.response.body.description : ''}`);
// });

console.log('Bot is running...');