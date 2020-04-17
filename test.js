import { spawn } from 'node-pty'
import { fromEvent } from 'rxjs'

const virsh = ['virsh', ['event', '--all', '--loop', '--timestamp']]

const ptyProcess = spawn(...virsh)

fromEvent(ptyProcess, 'data').subscribe(
  chunk => console.log('test: chunk: ' + JSON.stringify(chunk, null, 2)),
  error => console.error('test: error: ' + JSON.stringify(error, null, 2))
)
