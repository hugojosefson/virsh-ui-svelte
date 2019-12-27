import ErrorHandler from '../middleware/error-handler'
import { compose } from 'compose-middleware'

const errorHandler = ErrorHandler()

export default middleware => compose(middleware, errorHandler)
