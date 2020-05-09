import posts from './_posts.js'
import respond from 'express-respond-simple'

const { respond200 } = respond

const contents = posts.map((post) => ({
  title: post.title,
  slug: post.slug,
}))

export const get = respond200(contents)
