import { execSync } from 'child_process'
import request from 'supertest'
import { app } from '../src/app'
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'

describe('Meals routes', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  beforeEach(() => {
    execSync('npm run knex migrate:rollback --all')
    execSync('npm run knex migrate:latest')
  })

  it('should be able to create a new meal', async () => {
    const userResponse = await request(app.server)
      .post('/users')
      .send({ name: 'Will', email: 'fakeEmail@mail.com' })
      .expect(201)

    await request(app.server)
      .post('/meals')
      .set('Cookie', userResponse.get('Set-Cookie') ?? [])
      .send({
        name: 'Almoço',
        description: 'hora do lanche',
        isOnDiet: true,
        date: new Date(),
      })
      .expect(201)
  })

  it('should be able to list all meals from a user', async () => {
    const userResponse = await request(app.server)
      .post('/users')
      .send({ name: 'Will', email: 'fakeEmail@mail.com' })
      .expect(201)

    await request(app.server)
      .post('/meals')
      .set('Cookie', userResponse.get('Set-Cookie') ?? [])
      .send({
        name: 'Almoço',
        description: 'hora do lanche',
        isOnDiet: true,
        date: new Date(),
      })
      .expect(201)

    await request(app.server)
      .post('/meals')
      .set('Cookie', userResponse.get('Set-Cookie') ?? [])
      .send({
        name: 'Almoço 2',
        description: 'hora do lanche 2',
        isOnDiet: true,
        date: new Date(Date.now() + 24 * 60 * 60 * 2000), // 2 day after
      })
      .expect(201)

    const mealsResponse = await request(app.server)
      .get('/meals')
      .set('Cookie', userResponse.get('Set-Cookie') ?? [])
      .expect(200)

    expect(mealsResponse.body.meals).toHaveLength(2)

    // validate order
    expect(mealsResponse.body.meals[0].name).toBe('Almoço')
    expect(mealsResponse.body.meals[1].name).toBe('Almoço 2')
  })

  it('should be able to show a single meal', async () => {
    const userResponse = await request(app.server)
      .post('/users')
      .send({ name: 'Will', email: 'fakeEmail@mail.com' })
      .expect(201)

    await request(app.server)
      .post('/meals')
      .set('Cookie', userResponse.get('Set-Cookie') ?? [])
      .send({
        name: 'Almoço',
        description: 'hora do lanche',
        isOnDiet: true,
        date: new Date(),
      })
      .expect(201)

    const mealsResponse = await request(app.server)
      .get('/meals')
      .set('Cookie', userResponse.get('Set-Cookie') ?? [])
      .expect(200)

    const mealId = mealsResponse.body.meals[0].id

    const mealResponse = await request(app.server)
      .get(`/meals/${mealId}`)
      .set('Cookie', userResponse.get('Set-Cookie') ?? [])
      .expect(200)

    expect(mealResponse.body).toEqual({
      meal: expect.objectContaining({ ...mealResponse.body[0] }),
    })
  })

  it('should be able to update a meal from a user', async () => {
    const userResponse = await request(app.server)
      .post('/users')
      .send({ name: 'Will', email: 'fakeEmail@mail.com' })
      .expect(201)

    await request(app.server)
      .post('/meals')
      .set('Cookie', userResponse.get('Set-Cookie') ?? [])
      .send({
        name: 'Almoço',
        description: 'hora do lanche',
        isOnDiet: true,
        date: new Date(),
      })
      .expect(201)

    const mealsResponse = await request(app.server)
      .get('/meals')
      .set('Cookie', userResponse.get('Set-Cookie') ?? [])
      .expect(200)

    const mealId = mealsResponse.body.meals[0].id

    await request(app.server)
      .put(`/meals/${mealId}`)
      .set('Cookie', userResponse.get('Set-Cookie') ?? [])
      .send({
        name: 'Janta',
        description: 'Ultimo lanche',
        isOnDiet: true,
        date: new Date(),
      })
      .expect(200)
  })

  it('should be able to delete a meal from a user', async () => {
    const userResponse = await request(app.server)
      .post('/users')
      .send({ name: 'Will', email: 'fakeEmail@mail.com' })
      .expect(201)

    await request(app.server)
      .post('/meals')
      .set('Cookie', userResponse.get('Set-Cookie') ?? [])
      .send({
        name: 'Almoço',
        description: 'hora do lanche',
        isOnDiet: true,
        date: new Date(),
      })
      .expect(201)

    const mealsResponse = await request(app.server)
      .get('/meals')
      .set('Cookie', userResponse.get('Set-Cookie') ?? [])
      .expect(200)

    const mealId = mealsResponse.body.meals[0].id

    await request(app.server)
      .delete(`/meals/${mealId}`)
      .set('Cookie', userResponse.get('Set-Cookie') ?? [])
      .expect(200)
  })

  it('should be able to get metrics from a user', async () => {
    const userResponse = await request(app.server)
      .post('/users')
      .send({ name: 'Will', email: 'fakeEmail@mail.com' })
      .expect(201)

    await request(app.server)
      .post('/meals')
      .set('Cookie', userResponse.get('Set-Cookie') ?? [])
      .send({
        name: 'Almoço 1',
        description: 'Primeiro lanche',
        isOnDiet: true,
        date: new Date('2024-04-01T09:30:00'),
      })
      .expect(201)

    await request(app.server)
      .post('/meals')
      .set('Cookie', userResponse.get('Set-Cookie') ?? [])
      .send({
        name: 'Almoço 2',
        description: 'Segundo lanche',
        isOnDiet: false,
        date: new Date('2024-04-01T13:00:00'),
      })
      .expect(201)

    await request(app.server)
      .post('/meals')
      .set('Cookie', userResponse.get('Set-Cookie') ?? [])
      .send({
        name: 'Lanche',
        description: 'Primeiro lanche',
        isOnDiet: true,
        date: new Date('2024-04-01T18:00:00'),
      })
      .expect(201)

    await request(app.server)
      .post('/meals')
      .set('Cookie', userResponse.get('Set-Cookie') ?? [])
      .send({
        name: 'Lanche',
        description: 'Segundo lanche',
        isOnDiet: true,
        date: new Date('2024-04-01T21:00:00'),
      })

    await request(app.server)
      .post('/meals')
      .set('Cookie', userResponse.get('Set-Cookie') ?? [])
      .send({
        name: 'Janta',
        description: 'Janta',
        isOnDiet: true,
        date: new Date('2024-04-01T23:00:00'),
      })

    const metricsResponse = await request(app.server)
      .get('/meals/metrics')
      .set('Cookie', userResponse.get('Set-Cookie') ?? [])
      .expect(200)

    expect(metricsResponse.body).toEqual({
      totalMeals: 5,
      totalMealsOnDiet: 4,
      totalMealsOffDiet: 1,
      bestSequenceOnDietSequence: 3,
    })
  })
})
