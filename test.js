import { spawn } from 'node-pty'
import { fromEvent } from 'rxjs'

const virsh = ['virsh', ['event', '--all', '--loop', '--timestamp']]

const ptyProcess = spawn(...virsh)

fromEvent(ptyProcess, 'data').subscribe(
  chunk => console.log('chunk: ' + JSON.stringify(chunk, null, 2)),
  error => console.error('error: ' + JSON.stringify(error, null, 2))
)
