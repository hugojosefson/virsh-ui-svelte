const constantMappers = {
  int: ({ value }) => Number(value)
}

const depth = (node, count = 0) => {
  if (!node) {
    return count
  }
  if (count > 5) {
    throw new Error('Too deep.')
  }
  return depth(node.parent, count + 1)
}

const valid = node => {
  if (!node) {
    throw new Error('No node.')
  }
  if (!node._nodetype) {
    throw new Error('No _nodetype.')
  }
  return node
}

const indent = node => ' '.repeat(depth(node) * 2)
const unknown = (type, prop = type) => node =>
  `/* Unknown ${type} ${node[prop] ||
    JSON.stringify({ ...node, parent: 'hidden' }, null, 2)} */`
const unknownConstant = unknown('Constant', 'value')

const nodeMappers = {
  FileAST: node =>
    node.ext
      .map(child => map({ ...valid(child), parent: node }))
      .filter(Boolean)
      .join('\n\n'),

  Typedef: node => `${map({ ...valid(node.type), parent: node })}`,

  TypeDecl: node => {
    if (!node.type) {
      return ''
    }
    if (node.parent && node.parent.name && node.declname !== node.parent.name) {
      throw new Error(
        [
          `declname ${JSON.stringify(node.declname)}`,
          `!==`,
          `parent.name ${JSON.stringify(node.parent.name)}`
        ].join(' ')
      )
    }
    return map({ ...valid(node.type), parent: node })
  },

  Enum: node =>
    `const ${node.name ||
      node.declname ||
      node.parent.name ||
      node.parent.declname} = ${map({
      ...valid(node.values),
      parent: node
    })}`,

  EnumeratorList: node =>
    [
      `{`,
      `${node.enumerators
        .map(enumerator => map({ ...valid(enumerator), parent: node }))
        .join(',\n')}`,
      `${indent(node.parent)}}`
    ].join('\n'),

  Enumerator: node => {
    const renderValue = value => {
      if (value && value._nodetype) {
        return map({ ...valid(node.value), parent: node })
      }
      if (value === null) {
        return 'null'
      }
    }
    const valueRendered = renderValue(node.value)
    return `${indent(node.parent)}${node.name}: ${valueRendered}`
  },

  Constant: node => (constantMappers[node.type] || unknownConstant)(node),

  UnaryOp: node => `${node.op}${map({ ...valid(node.expr), parent: node })}`,

  BinaryOp: node =>
    [
      map({ ...valid(node.left), parent: node }),
      node.op,
      map({ ...valid(node.right), parent: node })
    ].join(' '),

  Decl: node => {
    if (node.parent && node.parent._nodetype === 'ParamList') {
      return `${node.name}`
    }
    const type = map({
      ...valid(node.type),
      parent: node
    })
    if (type) {
      return `${indent(node)}const ${node.name} = ${type}`
    } else {
      return ``
    }
  },

  ID: ({ name }) => name,

  FuncDecl: node => {
    return ''
    const args = map({ ...valid(node.args), parent: node })
    const type = map({
      ...valid(node.type),
      parent: node
    })
    const impl = `{/* not implemented */}}`
    return `(${args}): ${type} => ${impl}`
  },

  ParamList: node =>
    node.params.map(param => map({ ...param, parent: node })).join(', '),

  IdentifierType: () => '',

  PtrDecl: () => '',

  Struct: () => ''
}

const findNodeMapper = node => nodeMappers[node._nodetype]

const map = node => {
  if (node == null) {
    return ''
  }
  const mapper = findNodeMapper(node) || unknown('_nodetype')
  return mapper(node)
}

export default map
