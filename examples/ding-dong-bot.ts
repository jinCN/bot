/**
 * Wechaty - WeChat Bot SDK for Personal Account, Powered by TypeScript, Docker, and 💖
 *  - https://github.com/chatie/wechaty
 */
import {
  Contact,
  Message,
  ScanStatus,
  Wechaty,
  log,
}               from 'wechaty'

import { generate } from 'qrcode-terminal'
import axios from 'axios'
import hash from 'hash-sum'

// You can safely ignore the next line because it is using for CodeSandbox
require('./.code-sandbox.js')

function onScan (qrcode: string, status: ScanStatus) {
  if (status === ScanStatus.Waiting || status === ScanStatus.Timeout) {
    generate(qrcode, { small: true })  // show qrcode on console

    const qrcodeImageUrl = [
      'https://wechaty.js.org/qrcode/',
      encodeURIComponent(qrcode),
    ].join('')

    log.info('StarterBot', 'onScan: %s(%s) - %s', ScanStatus[status], status, qrcodeImageUrl)
  } else {
    log.info('StarterBot', 'onScan: %s(%s)', ScanStatus[status], status)
  }
}

function onLogin (user: Contact) {
  log.info('StarterBot', '%s login', user)
}

function onLogout (user: Contact) {
  log.info('StarterBot', '%s logout', user)
  process.exit(1)
}
let sessions:{ [propName: string]: any} = {}

async function onMessage (msg: Message) {
  log.info('StarterBot', msg.toString())

  let self = msg.self()
  let to = msg.to()
  let toMe = !!to&&to.id===msg.wechaty.puppet.selfId()
  let meToOther = self&&!toMe

  const from = msg.from()
  // const to   = this.to()
  const room = msg.room()

  let conversationId: string
  let conversation

  if (room) {
    conversation = room
    conversationId = room.id
  } else if (meToOther){
    conversation = to!
    conversationId = conversation.id
  }else {
    conversation = from!
    conversationId = conversation.id
  }

  let say=async (text:any)=>{
    await msg.wechaty.puppet.messageSendText(
      conversationId,
      text
    )
  }
  if (msg.text() === 'ding') {

      await say('dong')
      sessions[conversation.toString()] = sessions[conversation.toString()] || {}
      sessions[conversation.toString()].time = new Date()
      console.log(`sessions:`, sessions);

  } else{
    if(meToOther&&!msg.text().endsWith('。')){}else {

      // @ts-ignore
      if (sessions[conversation.toString()] && sessions[conversation.toString()].time - 0 > new Date().getTime() - 2 * 60 * 1000) {
        try {
          console.log(`sessions:`, sessions);
          console.log(`sessions in`);

          let userId
          if (room) {
            userId=conversation.toString()
          }else if(meToOther){
            userId=msg.to()!.toString()
          }else{
            userId=msg.from()!.toString()
          }
          let {data: {results: [{values: {text}}]}} = await axios.post('http://openapi.tuling123.com/openapi/api/v2', {
            "reqType": 0,
            "perception": {
              "inputText": {
                "text": msg.text()
              },
            },
            "userInfo": {
              "apiKey": "1b6926a6343a45608e997e8043b5a31c",
              userId: hash(userId)
            }
          })
          if (text) {
            await msg.say(text);
            console.log(`sessions said`);

          }
          sessions[conversation.toString()] = sessions[conversation.toString()] || {}
          sessions[conversation.toString()].time = new Date()
        } catch (e) {
          console.error(`e:`, e);
        }
      }
    }
  }
}

const bot = new Wechaty({
  name: 'ding-dong-bot',
  /**
   * Specify a `puppet` for a specific protocol (Web/Pad/Mac/Windows, etc).
   *
   * You can use the following providers:
   *  - wechaty-puppet-hostie
   *  - wechaty-puppet-puppeteer
   *  - wechaty-puppet-padplus
   *  - etc.
   *
   * Learn more about Wechaty Puppet Providers at:
   *  https://github.com/wechaty/wechaty-puppet/wiki/Directory
   */

  // puppet: 'wechaty-puppet-hostie',

})

bot.on('scan',    onScan)
bot.on('login',   onLogin)
bot.on('logout',  onLogout)
bot.on('message', onMessage)

bot.start()
  .then(() => log.info('StarterBot', 'Starter Bot Started.'))
  .catch(e => log.error('StarterBot', e))
