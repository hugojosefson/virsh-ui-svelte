import ast from './libvirt-domain.json'
import translate from './translate'

const output = translate(ast)
console.log(output)
