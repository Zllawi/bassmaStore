import { Router } from 'express'
import { auth, requireRole } from '../../middlewares/auth'
import * as c from './controller'

const r = Router()

r.get('/', auth(), requireRole('admin'), c.list)
r.patch('/:id', auth(), requireRole('admin'), c.update)
r.delete('/:id', auth(), requireRole('admin'), c.remove)

export default r
