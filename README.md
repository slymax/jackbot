**Jackbot** is a Telegram bot with multiple skills. You can switch between its different modes by sending the following commands:

In **`/convert`** mode, you can convert prices to work hours.

In **`/decide`** mode, you can send a list of options (separated by spaces or line breaks) to receive one random option as a response.

In **`/remind`** mode, you can create reminders. The date has to be surrounded by brackets and must follow the format defined in the configuration file. For recurring reminders, the date has to be in [cron](https://en.wikipedia.org/wiki/Cron) format.

In **`/youtube`** mode, you can extract audio from youtube videos. Send a link to a youtube video and Jackbot will respond with the extracted mp3 file. This feature requires `ffmpeg` to be installed on your system.

Jackbot can also monitor websites for changes. You can add websites you want to watch to the configuration file and optionally, define a css selector if you want to only monitor a specific part of the website. If you want to receive a notification when the website contains a specific keyword, you can also specify an optional keyword in the configuration file.

Jackbot also provides an endpoint that can be used for forwarding requests to your Telegram account. The path and port where Jackbot listens for requests, can be specified in the configuration file.

### Getting started

1. [Download](https://github.com/slymax/jackbot/archive/master.zip) or clone this repository and run `npm install` to install dependencies.
2. To configure Jackbot, run `cp example.json config.json` and edit the `config.json` file.
3. Run `npm start`.

### Configuration

`key` – your telegram api key obtained from the [botfather](https://core.telegram.org/bots#6-botfather).

`user` – your telegram user id.

`store` – the name of the storage file (this can usually be left unchanged).

`convert` – your hourly income, your daily work hours and how many days you work per week and year.

`remind` – the date format used for creating reminders.

`forward` – the path and port where Jackbot should listen for requests to forward.

`monitor` – the schedule on which to check for website changes (in [cron](https://en.wikipedia.org/wiki/Cron) format) and the list of websites to monitor (with optional css selectors and keywords).
