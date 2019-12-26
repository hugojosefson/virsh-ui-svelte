export const get = (req, res, next) => {
  const domain = req.appState.getDomain(req)
  res.send({
    jsonapi: {
      version: '1.0',
    },
    data: {
      type: 'domain',
      id: domain.uuid,
      ...domain,
    },
  })
}
