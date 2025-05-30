import request from 'supertest'
import 'dotenv/config'

import { app, data } from './index.js'

describe('Backend API Tests', () => {
    describe('GET /data', () => {
        it('should return default 20 items when no parameters are provided', async () => {
            const response = await request(app).get('/data')
            expect(response.status).toBe(200)
            expect(Array.isArray(response.body)).toBe(true)
            expect(response.body.length).toBe(20)
        })

        it('should filter results based on search parameter', async () => {
            const allData = await request(app).get('/data')
            const searchTerm = allData.body[0].first_name

            const response = await request(app).get('/data').query({ search: searchTerm })

            expect(response.status).toBe(200)
            expect(Array.isArray(response.body)).toBe(true)
            expect(
                response.body.every(
                    (item) =>
                        item.first_name.includes(searchTerm) ||
                        item.last_name.includes(searchTerm) ||
                        item.email.includes(searchTerm) ||
                        item.phone.includes(searchTerm),
                ),
            ).toBe(true)
        })

        it('should handle range parameter correctly', async () => {
            const range = [0, 10]
            const response = await request(app)
                .get('/data')
                .query({ range: JSON.stringify(range) })

            expect(response.status).toBe(200)
            expect(Array.isArray(response.body)).toBe(true)
            expect(response.body.length).toBe(10)
        })

        it('should return 400 for invalid range format', async () => {
            const response = await request(app).get('/data').query({ range: 'invalid' })

            expect(response.status).toBe(400)
            expect(response.body.error).toBe('Invalid range format. Expected format: [number, number]')
        })
    })

    describe('POST /action', () => {
        it('should return 400 for invalid request body', async () => {
            const response = await request(app)
                .post('/action')
                .send('invalid')

            expect(response.status).toBe(400)
            expect(response.body.error).toBe('Invalid request body')
        })

        it('should return 400 for invalid action type', async () => {
            const response = await request(app)
                .post('/action')
                .send([{ type: 'invalid', payload: [1, 2] }])

            expect(response.status).toBe(400)
            expect(response.body.error).toBe('Invalid action type at index 0')
        })

        it('should return 400 for invalid swap payload', async () => {
            const response = await request(app)
                .post('/action')
                .send([{ type: 'swap', payload: 'invalid' }])

            expect(response.status).toBe(400)
            expect(response.body.error).toBe('Invalid payload for swap action at index 0')
        })

        it('should return 400 for invalid toggle payload', async () => {
            const response = await request(app)
                .post('/action')
                .send([{ type: 'toggle', payload: 'invalid' }])

            expect(response.status).toBe(400)
            expect(response.body.error).toBe('Invalid payload for toggle action at index 0')
        })

        it('should successfully swap two items', async () => {
            const initialData = [...data]
            const [firstItem, secondItem] = initialData

            const response = await request(app)
                .post('/action')
                .send([{ type: 'swap', payload: [firstItem.id, secondItem.id] }])

            expect(response.status).toBe(200)
            expect(data[0]).toEqual(secondItem)
            expect(data[1]).toEqual(firstItem)
        })

        it('should successfully toggle an item', async () => {
            const initialData = [...data]
            const firstItem = initialData[0]

            const response = await request(app)
                .post('/action')
                .send([{ type: 'toggle', payload: [firstItem.id, true] }])

            expect(response.status).toBe(200)
            expect(data[0].checked).toBe(true)
        })

        it('should handle multiple actions in sequence', async () => {
            const initialData = [...data]
            const [firstItem, secondItem] = initialData

            const response = await request(app)
                .post('/action')
                .send([
                    { type: 'swap', payload: [firstItem.id, secondItem.id] },
                    { type: 'toggle', payload: [firstItem.id, true] }
                ])

            expect(response.status).toBe(200)
            expect(data[0]).toEqual(secondItem)
            expect(data[1]).toEqual(firstItem)
            expect(data[1].checked).toBe(true)
        })
    })
})
