import s from '../fn/s'

export default (obsGetter, render) => (ws, req) => {
  const obs = obsGetter(req)
  const unsubscribe = obs.subscribe(
    data => {
      if (ws.OPEN === ws.readyState) {
        ws.send(s(render(req, data)))
      }
    },
    error => {
      console.error('server/ws-push: error', error, error.stack)
    }
  )
  ws.on('error', error =>
    console.error(`server/ws-push: ws.on('error')`, error, error.stack)
  )
  ws.on('close', unsubscribe)
}
