export default defineEventHandler((event) => {
  const query = getQuery(event)
  return quizStep(filtersFromQuery(query), quizSkipFromQuery(query.skip))
})
