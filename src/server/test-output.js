import { of } from 'rxjs'
import { take } from 'rxjs/operators'
import s from '../fn/s'
import initAppState from './app-state'

export default async () => {
  const { getPath, onPath } = await initAppState()

  onPath(['domains', '16142a02-ca12-488c-90fa-c02d661956de']).subscribe(
    o => console.log(s(o)),
    console.error.bind(console),
    () => console.log('done')
  )

  return new Promise(() => {})
}
