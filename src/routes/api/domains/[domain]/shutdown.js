import { shutdown } from '../../../../server/virsh'

export const post = (req, res, next) => {
  const domain = req.appState.getDomain(req.domain)
  shutdown(domain.id).then(message =>
    res.status(202).send({ data: { message } })
  )
}
