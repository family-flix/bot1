#!/usr/bin/env -S node --no-warnings --loader ts-node/esm

import { createReadStream, statSync, readdirSync } from "fs";
import path from "path";
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
  // UrlLink,
  types,
  log,
} from "wechaty";

import { FlixWechatBot, App } from "./domains/flix_bot/index";
import { ensure_sync } from "./utils/fs";

const bot = WechatyBuilder.build({
  name: "speech-bot",
  puppet: "wechaty-puppet-wechat",
  puppetOptions: {
    uos: true,
  },
});
process.env.VOICE_RECOGNIZE_SECRET_ID = "AKID7IKDsOhqCRZmodEd2Sl5YrwlS0Vp21zt";
process.env.VOICE_RECOGNIZE_SECRET_KEY = "x30mKhspbEtStCYO8kAZsCStEVfiYJxV";
process.env.OUTPUT_PATH = "/apps/flix_prod";
process.env.DATABASE_PATH =
  "/apps/flix_prod/data/family-flix.db?connection_limit=1";
const app = new App({
  root_path: process.env.OUTPUT_PATH || process.cwd(),
  env: process.env as Record<string, string>,
});
const client = new FlixWechatBot({ app });

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
  console.log(`RECV: ${msg}`, msg.type(), msg.age());
  // log.info("StarterBot", msg.toString());
  if (msg.self()) {
    return;
  }
  if (msg.age() > 30) {
    await msg.say("outdate");
    return;
  }
  if (msg.text() === "ding") {
    await msg.say("dong");
    return;
  }
  // if (msg.text() === "link") {
  //   const urlLink = new UrlLink({
  //     description:
  //       "WeChat Bot SDK for Individual Account, Powered by TypeScript, Docker, and Love",
  //     thumbnailUrl:
  //       "https://avatars0.githubusercontent.com/u/25162437?s=200&v=4",
  //     title: "Welcome to Wechaty",
  //     url: "https://github.com/chatie/wechaty",
  //   });
  //   msg.say(urlLink);
  //   return;
  // }
  const fileTypeList = [
    bot.Message.Type.Attachment,
    bot.Message.Type.Audio,
    bot.Message.Type.Image,
    bot.Message.Type.Video,
  ];
  if (fileTypeList.includes(msg.type())) {
    const fileBox = await msg.toFileBox();
    // console.log(Buffer.byteLength(await fileBox.toBuffer()));
    const filename = fileBox.name;
    const cwd = process.cwd();
    const folderpath = path.resolve(cwd, "./files", filename);
    ensure_sync(folderpath);
    await fileBox.toFile(folderpath);
    const mp3Stream = createReadStream(folderpath);
    const r = await client.handleAudio(mp3Stream);
    if (r.error) {
      await msg.say(r.error.message);
      return;
    }
    await msg.say(r.data);
  }
}

bot.on("scan", onScan);
bot.on("login", onLogin);
bot.on("logout", onLogout);
bot.on("message", onMessage);

bot
  .start()
  .then(() => log.info("StarterBot", "Starter Bot Started."))
  .catch((e) => log.error("StarterBot", e));
