import http from 'http'
import { compose } from 'compose-middleware'
import cors from 'cors'
import allowMethods from 'allow-methods'

const toUpperCase = s => s.toUpperCase()
const isHttpMethod = method => http.METHODS.includes(method)

const sapperCors = ({ reqProp = 'sapperRoute', corsOptions }) => (
  req,
  res,
  next
) => {
  if (!req[reqProp]) {
    return next()
  }

  const { handlers } = req[reqProp]
  const declaredMethods = Object.keys(handlers).map(toUpperCase)
  const isOptionsDeclared = declaredMethods.includes('OPTIONS')

  if (isOptionsDeclared && req.method.toUpperCase() === 'OPTIONS') {
    // Leave it to the declared handler
    next()
  }

  const methods = [
    ...declaredMethods,
    ...(isOptionsDeclared ? [] : ['OPTIONS'])
  ].filter(isHttpMethod)

  const handleThisRequest = compose(
    cors({ ...corsOptions, methods }),
    allowMethods(methods)
  )
  handleThisRequest(req, res, next)
}

export default sapperCors
