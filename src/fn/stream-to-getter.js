export default (stream, initialValue) => {
  let value = initialValue
  stream.each(newValue => {
    value = newValue
  })
  return () => value
}
