export default (
  preload,
  [page, session] = [],
  handlePreloaded,
  interval = 1000
) => {
  let stop = false
  const reload = () => {
    if (stop) return
    preload
      .call(window, page, session)
      .then(handlePreloaded)
      .then(() => setTimeout(reload, interval))
    return () => {
      stop = true
    }
  }
  return reload
}
