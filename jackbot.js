const moment = require("moment");
const config = require("./config");
const Store = require("data-store");
const Telegraf = require("telegraf");
const schedule = require("node-schedule");
const reminders = new Store(config.store);
const bot = new Telegraf(config.key);
const app = require("express")();
const commands = {};

const skills = {
    decide: ctx => {
        const options = ctx.message.text.split(ctx.message.text.includes("\n") ? "\n" : " ");
        ctx.reply(options[Math.floor(Math.random() * options.length)]);
    },
    convert: ctx => {
        const hours = ctx.message.text / config.convert.hour;
        const days = hours / config.convert.day;
        const weeks = days / config.convert.week;
        const years = days / config.convert.year;
        const minutes = hours * 60;
        const months = years * 12;
        if (years > 1) ctx.reply(`${years.toFixed(2)} years`);
        else if (months > 1) ctx.reply(`${months.toFixed(2)} months`);
        else if (weeks > 1) ctx.reply(`${weeks.toFixed(2)} weeks`);
        else if (days > 1) ctx.reply(`${days.toFixed(2)} days`);
        else if (hours > 1) ctx.reply(`${hours.toFixed(2)} hours`);
        else ctx.reply(`${minutes.toFixed(2)} minutes`);
    },
    remind: ctx => {
        const time = ctx.message.text.match(/\((.*?)\)/);
        const id = Math.random().toString(36).substr(2,9);
        const once = time[1].includes(":");
        const reminder = {
            once: once,
            chat: ctx.chat.id,
            date: once ? moment(time[1], config.remind.format).toDate() : time[1],
            text: ctx.message.text.replace(time[0],"").trim()
        }
        schedule.scheduleJob(reminder.date, () => {
            if (once) reminders.del(id);
            ctx.reply(reminder.text);
        });
        reminders.set(id, reminder);
    }
}

bot.on("message", ctx => {
    if (config.users && !config.users.includes(ctx.chat.id)) return;
    if (ctx.message.entities && ctx.message.entities[0].type === "bot_command") {
        commands[ctx.chat.id] = ctx.message.text.substr(1);
    } else if (commands[ctx.chat.id] && skills[commands[ctx.chat.id]]) {
        skills[commands[ctx.chat.id]](ctx);
    }
}).startPolling();

app.get(`/${config.push.path}/:text`, (request, response) => {
    bot.telegram.sendMessage(config.push.chat, request.params.text);
    response.end();
}).listen(config.push.port);

for (id in reminders.data) {
    const reminder = reminders.data[id];
    schedule.scheduleJob(reminder.date, () => {
        bot.telegram.sendMessage(reminder.chat, reminder.text);
        if (reminder.once) reminders.del(id);
    });
}
