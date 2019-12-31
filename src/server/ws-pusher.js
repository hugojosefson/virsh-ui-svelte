import s from '../fn/s'

export default getAppStateStream => render => (ws, req) => {
  const appStateStream = getAppStateStream()
  appStateStream.each(() => {
    if (ws.OPEN === ws.readyState) {
      ws.send(s(render(req)))
    }
  })
  ws.on('close', () => appStateStream.destroy())
}
