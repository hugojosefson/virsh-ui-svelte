export default port => app =>
  new Promise((resolve, reject) => {
    const server = app.listen(port, () => resolve(server))
    server.on('error', reject)
  })
