import toObject from 'to-object-reducer'
import posts from './_posts.js'

// prettier-ignore
const lookup =
  posts
    .map(post => [post.slug, post])
    .reduce(toObject, {})

export function get(req, res, next) {
  // the `slug` parameter is available because
  // this file is called [slug].json.js
  const { slug } = req.params

  const post = lookup[slug]
  if (post) {
    res.json(post)
  } else {
    res.status(404).json({
      message: 'Not found',
    })
  }
}
