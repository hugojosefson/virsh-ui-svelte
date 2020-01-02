export default middleware => (ws, req, next) =>
  middleware(req, Symbol('fakeres'), next)
