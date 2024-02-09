#!/usr/bin/env -S node --no-warnings --loader loader.js
/**
 *   Wechaty - https://github.com/chatie/wechaty
 *
 *   @copyright 2016-2018 Huan LI <zixia@zixia.net>
 *
 *   Licensed under the Apache License, Version 2.0 (the "License");
 *   you may not use this file except in compliance with the License.
 *   You may obtain a copy of the License at
 *
 *       http://www.apache.org/licenses/LICENSE-2.0
 *
 *   Unless required by applicable law or agreed to in writing, software
 *   distributed under the License is distributed on an "AS IS" BASIS,
 *   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *   See the License for the specific language governing permissions and
 *   limitations under the License.
 *
 */

import {
  // createWriteStream,
  createReadStream,
} from "fs";
import { PassThrough, Readable } from "stream";
// import { exec } from "child_process";

// import request from "request";
// import Ffmpeg from "fluent-ffmpeg";
// import querystring from "querystring";

// import execa from "execa";
/* tslint:disable:variable-name */
import qrcodeTerminal from "qrcode-terminal";

/**
 * Change `import { ... } from '../.js'`
 * to     `import { ... } from 'wechaty'`
 * when you are runing with Docker or NPM instead of Git Source.
 */
import {
  Contact,
  Message,
  ScanStatus,
  WechatyBuilder,
  log,
  types,
} from "wechaty";

// import { FlixWechatBot, App } from "./domains/flix_bot/index";

// try {
//   const { stdout } = await execa.execa("yarn", ["prisma generate"]);
//   console.log(stdout);
// } catch (error) {
//   console.error(error);
// }

function onScan(qrcode: string, status: ScanStatus) {
  if (status === ScanStatus.Waiting || status === ScanStatus.Timeout) {
    const qrcodeImageUrl = [
      "https://wechaty.js.org/qrcode/",
      encodeURIComponent(qrcode),
    ].join("");
    log.info(
      "StarterBot",
      "onScan: %s(%s) - %s",
      ScanStatus[status],
      status,
      qrcodeImageUrl
    );

    qrcodeTerminal.generate(qrcode, { small: true }); // show qrcode on console
  } else {
    log.info("StarterBot", "onScan: %s(%s)", ScanStatus[status], status);
  }
}

function onLogin(user: Contact) {
  log.info("StarterBot", "%s login", user);
}

function onLogout(user: Contact) {
  log.info("StarterBot", "%s logout", user);
}

async function onMessage(msg: Message) {
  console.log(`RECV: ${msg}`, msg.type());
  log.info("StarterBot", msg.toString());

  if (msg.text() === "ding") {
    await msg.say("dong");
  }

  if (msg.type() !== types.Message.Audio) {
    return; // skip no-VOICE message
  }

  // const mp3Stream = await msg.readyStream()

  const msgFile = await msg.toFileBox();
  const filename = msgFile.name;
  msgFile.toFile(filename);

  const mp3Stream = createReadStream(filename);
}

const bot = WechatyBuilder.build({ name: "speech-bot" });
// const app = new App({
//   root_path: process.env.OUTPUT_PATH || process.cwd(),
//   env: process.env as Record<string, string>,
// });
// const client = new FlixWechatBot({ app });

// bot.start().catch((e) => console.error("bot.start() error: " + e));
bot.on("scan", onScan);
bot.on("login", onLogin);
bot.on("logout", onLogout);
bot.on("message", onMessage);

bot
  .start()
  .then(() => log.info("StarterBot", "Starter Bot Started."))
  .catch((e) => log.error("StarterBot", e));
