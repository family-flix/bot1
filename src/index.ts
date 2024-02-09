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

/* tslint:disable:variable-name */
import "dotenv/config.js";
import qrcodeTerminal from "qrcode-terminal";
import {
  Contact,
  Message,
  ScanStatus,
  WechatyBuilder,
  log,
  types,
} from "wechaty";

import { FlixWechatBot, App } from "./domains/flix_bot/index";

const bot = WechatyBuilder.build({ name: "speech-bot" });
// const app = new App({
//   root_path: process.env.OUTPUT_PATH || process.cwd(),
//   env: process.env as Record<string, string>,
// });
// const client = new FlixWechatBot({ app });

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
    return;
  }

  if (msg.type() !== types.Message.Audio) {
    return; // skip no-VOICE message
  }

  // const mp3Stream = await msg.readyStream()

  // const msgFile = await msg.toFileBox();
  // const filename = msgFile.name;
  // msgFile.toFile(filename);

  // const mp3Stream = createReadStream(filename);
  // const r = await client.handleAudio(mp3Stream);
  // if (r.error) {
  //   msg.say(r.error.message);
  //   return;
  // }
  // msg.say(r.data);
}

bot.on("scan", onScan);
bot.on("login", onLogin);
bot.on("logout", onLogout);
bot.on("message", onMessage);

bot
  .start()
  .then(() => log.info("StarterBot", "Starter Bot Started."))
  .catch((e) => log.error("StarterBot", e));
