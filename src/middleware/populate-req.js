import { take } from 'rxjs/operators'

export default propsObsGetter => (req, res, next) =>
  propsObsGetter(req)
    .pipe(take(1))
    .subscribe(props => {
      Object.assign(req, props)
      next()
    }, next)
