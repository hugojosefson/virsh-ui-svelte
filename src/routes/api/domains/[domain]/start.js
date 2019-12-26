import { start } from '../../../../server/virsh'

export const post = (req, res, next) => {
  const domain = req.appState.getDomain(req)
  start(domain.uuid).then(message =>
    res.status(200).send({ data: { message } })
  )
}
