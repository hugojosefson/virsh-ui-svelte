export default props => (req, res, next) => {
  Object.assign(req, props)
  next()
}
