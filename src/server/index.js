import s from '../fn/s'
import app from './app'
import startServer from './start-server'

const { PORT, NODE_ENV } = process.env
const dev = NODE_ENV === 'development'

app({ dev })
  .then(startServer(PORT))
  .then(
    server => {
      console.log(`Listening on ${s(server.address())}`)
    },
    error => {
      console.error('error', error)
      process.exit(1)
    }
  )
