import http from 'http'
import { compose } from 'compose-middleware'
import cors from 'cors'
import allowMethods from 'allow-methods'

const toUpperCase = s => s.toUpperCase()
const isHttpMethod = method => http.METHODS.includes(method)

const sapperCors = options => (req, res, next) => {
  if (!req.declaredRoute) {
    return next()
  }

  const { handlers } = req.declaredRoute
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
    cors({ ...options, methods }),
    allowMethods(methods)
  )
  handleThisRequest(req, res, next)
}

export default sapperCors
