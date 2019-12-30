import http from 'http'
import { compose } from 'compose-middleware'
import cors from 'cors'
import allowMethods from 'allow-methods'

const toUpperCase = s => s.toUpperCase()
const isHttpMethod = method => http.METHODS.includes(method)

const sapperCors = ({ routeProp = 'sapperRoute', corsOptions }) => (
  req,
  res,
  next
) => {
  if (!req[routeProp]) {
    return next()
  }

  const { handlers } = req[routeProp]
  const declaredMethods = Object.keys(handlers).map(toUpperCase)
  const isOptionsDeclared = declaredMethods.includes('OPTIONS')

  if (isOptionsDeclared && req.method.toUpperCase() === 'OPTIONS') {
    // Leave it to the declared handler
    next()
  }

  const methods = [
    ...declaredMethods,
    ...(isOptionsDeclared ? [] : ['OPTIONS']),
  ].filter(isHttpMethod)

  const handleThisRequest = compose(
    (req, res, next) => {
      if (req.method.toUpperCase() === 'OPTIONS') {
        res.header('Allow', methods.join(','))
      }
      next()
    },
    cors({ ...corsOptions, methods }),
    allowMethods(methods)
  )
  handleThisRequest(req, res, next)
}

export default sapperCors
