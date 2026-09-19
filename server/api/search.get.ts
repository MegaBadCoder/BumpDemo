export default defineEventHandler(event => searchEvents(filtersFromQuery(getQuery(event))))
