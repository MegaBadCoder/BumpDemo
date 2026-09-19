export default defineEventHandler((event) => {
  const id = Number(getRouterParam(event, 'id'))
  const found = Number.isInteger(id) ? findEvent(id) : null

  if (!found) {
    throw createError({ statusCode: 404, statusMessage: 'Event not found' })
  }

  return found
})
