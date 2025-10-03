require('dotenv').config();
const { getAndSaveStudentDetails } = require("./bot");
const cron = require('node-cron');
const TelegramBot = require('node-telegram-bot-api');
const { db, studentDetails } = require('./db');
const { eq } = require('drizzle-orm');


cron.schedule("* * * * *", () => {
    getAndSaveStudentDetails();
});


const sleep = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
}

const token = process.env.TELEGRAM_BOT_TOKEN;
const bot = new TelegramBot(token, { polling: true });

bot.on('message', async (msg) => {
    if (msg?.text?.trim() === '/stats') {
        const chatId = process.env.MY_CHAT_ID;

        const details = await db
            .select()
            .from(studentDetails)
            .where(eq(studentDetails.username, process.env.USERNAME));

        for (const detail of details) {
            const message = `
Fənn: ${detail.subject}
Saatların cəmi: ${detail.totalHours}
Kredit: ${detail.credits}
IE sayı: ${detail.ieCount}
QB sayı: ${detail.qbCount}
Davamiyyət: ${detail.attendance}%`;

            await bot.sendMessage(chatId, message); 
            await sleep(300); 
        }
    }
});


