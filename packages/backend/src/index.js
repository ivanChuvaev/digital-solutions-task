import express from 'express'
import path from 'path'
import { faker } from '@faker-js/faker'
import 'dotenv/config'
import cors from 'cors'

if (!process.env.PORT) {
    throw new Error('PORT is not set')
}

if (!process.env.FAKE_DATA_SIZE) {
    throw new Error('FAKE_DATA_SIZE is not set')
}

const app = express()
const port = process.env.PORT

app.use(cors())
app.use(express.json())
app.use(express.static(path.resolve('..', 'frontend', 'dist')))

const data = Array.from({ length: process.env.FAKE_DATA_SIZE }, (_, i) => ({
    id: i + 1,
    avatar: faker.image.avatar(),
    first_name: faker.person.firstName(),
    last_name: faker.person.lastName(),
    email: faker.internet.email(),
    phone: faker.phone.number(),
    checked: false,
}))

let subscribers = []

const subscribe = (handler) => {
    subscribers = [...subscribers, handler]
}

const unsubscribe = (handler) => {
    subscribers = subscribers.filter((cb) => cb !== handler)
}

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
            const fullName = `${item.first_name} ${item.last_name}`
            return (
                fullName.toUpperCase().includes(searchUpperCased) ||
                item.email.toUpperCase().includes(searchUpperCased) ||
                item.phone.toUpperCase().includes(searchUpperCased)
            )
        })
    }

    if (range) {
        result = result.slice(range[0], range[1])
    } else {
        result = result.slice(0, 20)
    }

    return res.json(result)
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

        if (item.type !== 'swap' && item.type !== 'toggle') {
            return res
                .status(400)
                .json({ error: `Invalid action type at index ${i}` })
        }

        switch (item.type) {
            case 'swap': {
                const isCorrectPayload =
                    Array.isArray(item.payload) &&
                    item.payload.length === 2 &&
                    !Number.isNaN(item.payload[0]) &&
                    !Number.isNaN(item.payload[1])

                if (!isCorrectPayload) {
                    return res.status(400).json({
                        error: `Invalid payload for swap action at index ${i}`,
                    })
                }
                break
            }
            case 'toggle': {
                const isCorrectPayload =
                    Array.isArray(item.payload) &&
                    item.payload.length === 2 &&
                    !Number.isNaN(item.payload[0]) &&
                    typeof item.payload[1] === 'boolean'

                if (!isCorrectPayload) {
                    return res.status(400).json({
                        error: `Invalid payload for toggle action at index ${i}`,
                    })
                }
            }
        }
    }

    // apply actions
    for (const item of req.body) {
        switch (item.type) {
            case 'swap': {
                const [a, b] = item.payload
                const aIndex = data.findIndex((item) => item.id === a)
                const bIndex = data.findIndex((item) => item.id === b)
                ;[data[aIndex], data[bIndex]] = [data[bIndex], data[aIndex]]
                break
            }
            case 'toggle': {
                const [id, value] = item.payload
                const index = data.findIndex((item) => item.id === id)
                data[index].checked = value
            }
        }
    }

    for (const subscriber of subscribers) {
        subscriber(id)
    }

    return res.sendStatus(200)
})

app.get('/is-data-changed-long-polling', async (_, res) => {
    const handler = (id) => res.status(200).json({ dataChanged: true, id })

    subscribe(handler)

    res.on('close', () => unsubscribe(handler))

    await new Promise((resolve) => {
        setTimeout(resolve, 30000)
    })

    if (res.closed) return

    unsubscribe(handler)

    res.status(200).json({ dataChanged: false })
})

if (process.env.NODE_ENV !== 'test') {
    app.listen(port, () => {
        console.log(`Listening on port ${port}`)
    })
}

export { app, data }
