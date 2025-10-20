import { Router } from 'express'
import * as c from './controller'

const r = Router()

r.post('/register', c.register)
r.post('/login', c.login)
r.post('/refresh', c.refresh)
r.post('/forgot', c.forgot)
r.post('/reset', c.reset)

export default r

