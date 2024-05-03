import fastify from 'fastify'
import cookie from '@fastify/cookie'
import { mealsRoutes, usersRoutes } from './routes'

export const app = fastify()

// app.addHook('preHandler', async (request) => {
//   console.log(`[${request.method}] ${request.url}`)
// })

app.register(cookie)

app.register(usersRoutes, { prefix: 'users' })
app.register(mealsRoutes, { prefix: 'meals' })
