import 'dotenv/config'

export const config = {
  applicationId: process.env.APPLICATION_ID || 'no application ID found',
  botName: process.env.BOT_NAME || 'no bot name found',
  persistDataPath: process.env.PERSIST_DATA_PATH || '.',
  token: process.env.TOKEN || 'no token found',
}
