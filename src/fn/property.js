export default initialValue => addListenerFn => {
  let value = initialValue
  addListenerFn(newValue => {
    value = newValue
  })
  return () => value
}
