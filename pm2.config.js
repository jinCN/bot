module.exports={
  "script": "ts-node", // or locally "./node_modules/.bin/_ts-node"
  "args": "src/main.ts",
  env: {
    WECHATY_PUPPET: 'wechaty-puppet-padplus',
    WECHATY_PUPPET_PADPLUS_TOKEN:'puppet_padplus_1493516d9d02fe28',
    WECHATY_LOG: 'verbose'
  }
}
