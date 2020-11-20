const moment = require("moment");
const config = require("./config");
const Store = require("data-store");
const Telegraf = require("telegraf");
const youtubedl = require("youtube-dl");
const schedule = require("node-schedule");
const reminders = new Store(config.store);
const bot = new Telegraf(config.key);
const fetch = require("node-fetch");
const cheerio = require("cheerio");
const app = require("express")();
const uuid = require('uuid/v4');
const fs = require("fs");

const commands = {};
const monitors = {};

const skills = {
    decide: ctx => {
        const text = ctx.message.text;
        const options = text.split(text.includes("\n") ? "\n" : (text.includes(",") ? "," : " "));
        ctx.reply(options[Math.floor(Math.random() * options.length)].trim());
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
        const id = uuid();
        const time = ctx.message.text.match(/\((.*?)\)/);
        const once = time[1].includes(":");
        const reminder = {
            once: once,
            date: once ? moment(time[1], config.remind.format).toDate() : time[1],
            text: ctx.message.text.replace(time[0],"").trim()
        }
        schedule.scheduleJob(reminder.date, () => {
            if (once) reminders.del(id);
            ctx.reply(reminder.text);
        });
        reminders.set(id, reminder);
        ctx.reply("Reminder set for " + reminder.date);
    },
    monitor: async () => {
        for (site of config.monitor.sites) {
            const html = await fetch(site.url);
            const text = await html.text();
            const $ = cheerio.load(text);
            const content = $(site.selector || "body").text().replace(/\s+/g, " ").trim();
            if (monitors[site.url] && monitors[site.url] !== content) {
                if (!site.keyword || content.toLowerCase().includes(site.keyword.toLowerCase())) {
                    bot.telegram.sendMessage(config.user, "Changes found on " + site.url);
                }
            }
            monitors[site.url] = content;
        }
    },
    youtube: ctx => {
        youtubedl.getInfo(ctx.message.text.trim(), [], (error, info) => {
            ctx.reply(`Downloading "${info.title}"`);
            youtubedl.exec(info.webpage_url, ["-x", "--audio-format", "mp3", "--output", `${info.title}.%(ext)s`], {}, () => {
                ctx.replyWithAudio({ source: `${info.title}.mp3` });
                fs.unlinkSync(`./${info.title}.mp3`);
            });
        });
    }
}

bot.on("message", ctx => {
    if (config.user === ctx.chat.id) {
        if (ctx.message.entities && ctx.message.entities[0].type === "bot_command") {
            commands[ctx.chat.id] = ctx.message.text.substr(1);
        } else if (commands[ctx.chat.id] && skills[commands[ctx.chat.id]]) {
            skills[commands[ctx.chat.id]](ctx);
        }
    }
}).startPolling();

app.get(`/${config.forward.path}/:text`, (request, response) => {
    bot.telegram.sendMessage(config.user, request.params.text);
    response.end();
}).listen(config.forward.port);

for (id in reminders.data) {
    const reminder = reminders.data[id];
    schedule.scheduleJob(reminder.date, () => {
        bot.telegram.sendMessage(config.user, reminder.text);
        if (reminder.once) reminders.del(id);
    });
}

schedule.scheduleJob(config.monitor.schedule, skills.monitor);
skills.monitor();
