import { getState } from '../../../../server/virsh'

export const get = (req, res, next) =>
  getState(req.uuid).then(state =>
    res.send({
      jsonapi: {
        version: '1.0',
      },
      data: {
        type: 'domain',
        id: req.uuid,
        state,
      },
    })
  )
