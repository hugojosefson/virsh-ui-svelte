import { shutdown } from '../../../../server/virsh'

export const post = (req, res, next) =>
  shutdown(req.uuid).then(message =>
    res.status(200).send({ data: { message } })
  )
