import 'dotenv/config'

export const config = {
  token: process.env.TOKEN || 'no token found',
  applicationId: process.env.APPLICATION_ID || 'no application ID found',
  botName: process.env.BOT_NAME || 'no bot name found',
}
