import envConfig from '@hugojosefson/env-config'
import { getDomains } from './virsh'
import s from '../fn/s'
import app from './app'
import startServer from './start-server'

const { PORT, NODE_ENV, TRUST_PROXY } = envConfig()
const dev = NODE_ENV === 'development'
const trustProxy =
  typeof TRUST_PROXY === 'undefined' ? () => false : TRUST_PROXY

getDomains().then(
  domains => {
    console.log(s(domains))

    startServer(PORT)(app({ dev, trustProxy })).then(
      server => {
        console.log(`Listening on ${s(server.address())}`)
      },
      error => {
        console.error('error', error)
        process.exit(1)
      }
    )
  },
  error => {
    console.error(s(error))
    process.exit(1)
  }
)
