import Redis from 'redis'
import connectRedis from 'connect-redis'
import expressSession from 'express-session'
import cryptoRandomString from 'crypto-random-string'

export default ({
  prefix = 'express-session',
  secret = cryptoRandomString({ length: 32 }),
  redis = {},
} = {}) => {
  const RedisStore = connectRedis(expressSession)
  const redisClient = Redis.createClient(redis)

  return expressSession({
    store: new RedisStore({
      client: redisClient,
      prefix,
    }),
    secret,
    saveUninitialized: false,
    resave: false,
  })
}
