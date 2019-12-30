export const selfLink = req =>
  `${req.protocol}://${req.headers.host}/api/domains`
