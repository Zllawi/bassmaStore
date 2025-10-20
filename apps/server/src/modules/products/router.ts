import { Router } from 'express'
import { auth } from '../../middlewares/auth'
import * as c from './controller'

const r = Router()

r.get('/', c.list)
r.get('/:id', c.getOne)
r.post('/', auth(), c.upload.array('images', 6), ...c.create)
r.patch('/:id', auth(), c.upload.array('images', 6), ...c.update)
r.delete('/:id', auth(), ...c.remove)

export default r
