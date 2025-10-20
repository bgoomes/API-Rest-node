import type { FastifyInstance } from 'fastify'
import { knex } from '../database.ts'
import { z } from 'zod'
import { checkSessionIdExit } from '../middleware/check-session-id-exit.ts'

export async function transactionsRoutes(app: FastifyInstance) {
  app.get('/', { preHandler: [checkSessionIdExit] }, async (request) => {
    const { sessionId } = request.cookies

    const transactions = await knex('transactions')
      .where('session_id', sessionId)
      .select()
    return { transactions }
  })

  app.get('/:id', { preHandler: [checkSessionIdExit] }, async (request) => {
    const getTransactionParamsSchema = z.object({
      id: z.string().uuid(),
    })
    const { id } = getTransactionParamsSchema.parse(request.params)
    const { sessionId } = request.cookies
    const transaction = await knex('transactions')
      .where({ session_id: sessionId, id })
      .first()
    return { transaction }
  })

  app.get('/summary', { preHandler: [checkSessionIdExit] }, async (request) => {
    const { sessionId } = request.cookies
    const summary = await knex('transactions')
      .where('session_id', sessionId)
      .sum('amount', { as: 'amount' })
      .first()
    return { summary }
  })

  app.post('/', async (request, reply) => {
    const createTransactionBodySchema = z.object({
      title: z.string(),
      amount: z.number(),
      type: z.enum(['credit', 'debit']),
    })

    const { title, amount, type } = createTransactionBodySchema.parse(
      request.body,
    )

    let sessionId = request.cookies.sessionId

    if (!sessionId) {
      sessionId = crypto.randomUUID()
      reply.setCookie('sessionId', sessionId, {
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 7 days
      })
    }

    await knex('transactions').insert({
      id: crypto.randomUUID(),
      title,
      amount: type === 'credit' ? amount : amount * -1,
      session_id: sessionId,
    })
    return reply.status(201).send()
  })
}
