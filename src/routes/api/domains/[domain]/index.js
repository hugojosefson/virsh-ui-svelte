export const get = async (req, res, next) => {
  res.send({
    jsonapi: {
      version: '1.0'
    },
    data: {
      type: 'domain',
      ...req.domain
    }
  })
}
