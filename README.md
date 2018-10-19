**Jackbot** is a multi-purpose Telegram bot. You can switch between different modes by sending the corresponding command.

In **`/convert`** mode, you can convert prices to work hours.

In **`/decide`** mode, you can send a list of options (separated by spaces or line breaks) to receive one random option as a response.

In **`/remind`** mode, you can create reminders. The date has to be surrounded by brackets and must follow the format defined in the configuration file. For recurring reminders, the date has to be in [cron](https://en.wikipedia.org/wiki/Cron) format.

Jackbot also provides an HTTP endpoint that can be used to forward requests to your Telegram account.

### Getting started

1. [Download](https://github.com/slymax/jackbot/archive/master.zip) or clone this repository and run `npm install` to install dependencies.
2. Configure Jackbot by editing the `config.json` file.
3. Run `node jackbot.js`.

### Configuration

`key` – your telegram api-key obtained from the [botfather](https://core.telegram.org/bots#6-botfather).

`users` – an array of user ids that is allowed to talk to your bot. If set to false or omitted, everyone can talk to your bot.

`convert` – your hourly income, your daily work hours and how many days you work per week and year.

`store` – the name of the storage file (this can usually be left unchanged).

`remind` – the date format used for creating reminders.

`push` – the chat id that will receive forwarded messages and the path and port where Jackbot should listen for requests.
