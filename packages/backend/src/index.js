import express from 'express'
import path from 'path'
import { faker } from '@faker-js/faker'
import 'dotenv/config'
import cors from 'cors'
import { swapPersonFactory } from './helpers/swapPersonFactory.js'
import { movePersonFactory } from './helpers/movePersonFactory.js'
import { togglePersonFactory } from './helpers/togglePersonFactory.js'
import { LongPollingNotifier } from './LongPollingNotifier.js'

if (!process.env.PORT) {
    throw new Error('PORT is not set')
}

if (!process.env.FAKE_DATA_SIZE) {
    throw new Error('FAKE_DATA_SIZE is not set')
}

if (!process.env.FAKER_SEED) {
    throw new Error('FAKER_SEED is not set')
}

const app = express()
const port = process.env.PORT

app.use(cors({
    exposedHeaders: ['total-count']
}))
app.use(express.json())
app.use(express.static(path.resolve('..', 'frontend', 'dist')))

const data = Array.from({ length: process.env.FAKE_DATA_SIZE }, (_, i) => ({
    checked: false,
    id: i + 1,
    index: i,
}))

const swapPerson = swapPersonFactory(data)
const movePerson = movePersonFactory(data)
const togglePerson = togglePersonFactory(data)

const longPollingNotifier = new LongPollingNotifier()

app.get('/data', (req, res) => {
    const { search, range: rangeStr } = req.query

    let range = null

    if (rangeStr) {
        try {
            range = JSON.parse(rangeStr)
            if (
                !Array.isArray(range) ||
                range.length !== 2 ||
                Number.isNaN(range[0]) ||
                Number.isNaN(range[1])
            ) {
                throw new Error()
            }
        } catch (error) {
            return res.status(400).json({
                error: 'Invalid range format. Expected format: [number, number]',
            })
        }
    }

    let result = data

    if (search) {
        result = result.filter((item) => {
            const searchUpperCased = search.toUpperCase()
            return item.id.toString().includes(searchUpperCased)
        })
    }

    const filteredCount = result.length

    if (range) {
        result = result.slice(range[0], range[1])
    } else {
        result = result.slice(0, 20)
    }

    const resultWithExtra = result.map((item) => {
        faker.seed(process.env.FAKER_SEED + item.id)
        return {
            ...item,
            avatar: faker.image.avatar(),
            first_name: faker.person.firstName(),
            last_name: faker.person.lastName(),
            email: faker.internet.email(),
        }
    })

    res.setHeader('total-count', filteredCount)

    return res.json(resultWithExtra)
})

/**
 * Example:
 * [
 *  { type: 'swap', payload: [0, 1] },
 *  { type: 'toggle', payload: [0, true] },
 * ]
 */
app.post('/action', (req, res) => {
    const { id } = req.query

    if (!id) {
        return res
            .status(400)
            .json({ error: 'id is required in search params' })
    }

    if (!req.body || !Array.isArray(req.body)) {
        return res.status(400).json({ error: 'Invalid request body' })
    }

    // validate request body
    for (let i = 0; i < req.body.length; i++) {
        const item = req.body[i]

        const isCorrectObject =
            typeof item === 'object' &&
            item !== null &&
            'type' in item &&
            'payload' in item
        if (!isCorrectObject) {
            return res
                .status(400)
                .json({ error: `Invalid action item at index ${i}` })
        }

        if (!['toggle', 'swap', 'move'].includes(item.type)) {
            return res
                .status(400)
                .json({ error: `Invalid action type at index ${i}` })
        }

        switch (item.type) {
            case 'move':
            case 'swap': {
                const isCorrectPayload =
                    Array.isArray(item.payload) &&
                    item.payload.length === 2 &&
                    typeof item.payload[0] === 'number' &&
                    typeof item.payload[1] === 'number' &&
                    !Number.isNaN(item.payload[0]) &&
                    !Number.isNaN(item.payload[1])

                if (!isCorrectPayload) {
                    return res.status(400).json({
                        error: `Invalid payload for ${item.type} action at index ${i}`,
                    })
                }
                break
            }
            case 'toggle': {
                const isCorrectPayload =
                    typeof item.payload === 'number' &&
                    !Number.isNaN(item.payload)

                if (!isCorrectPayload) {
                    return res.status(400).json({
                        error: `Invalid payload for toggle action at index ${i}`,
                    })
                }
                break
            }
        }
    }

    // apply actions
    for (const item of req.body) {
        switch (item.type) {
            case 'move': {
                movePerson(item.payload[0], item.payload[1])
                break
            }
            case 'swap': {
                swapPerson(item.payload[0], item.payload[1])
                break
            }
            case 'toggle': {
                togglePerson(item.payload)
                break
            }
        }
    }

    longPollingNotifier.notify(id, req.body)

    return res.sendStatus(200)
})

app.get('/is-data-changed-long-polling', async (req, res) => {
    const { id } = req.query

    if (!id) {
        return res
            .status(400)
            .json({ error: 'id is required in search params' })
    }

    const handler = (actions) => res.status(200).json({ actions })

    longPollingNotifier.subscribe(id, handler)

    res.on('close', () => longPollingNotifier.unsubscribe(id))

    await new Promise((resolve) => {
        setTimeout(resolve, 60 * 1000)
    })

    if (res.closed) return

    res.status(200).json({ actions: [] })
})

if (process.env.NODE_ENV !== 'test') {
    app.listen(port, () => {
        console.log(`Listening on port ${port}`)
    })
}

export { app, data }
