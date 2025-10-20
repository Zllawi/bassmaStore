import { Router } from 'express'
import { auth, requireRole } from '../../middlewares/auth'
import * as c from './controller'

const r = Router()

r.get('/', auth(), requireRole('admin'), c.list)
r.post('/', auth(), c.create)
r.get('/me', auth(), c.mine)
r.get('/:id', auth(), c.getOne)
r.patch('/:id', auth(), requireRole('admin'), c.update)
r.patch('/:id/status', auth(), requireRole('admin'), c.updateStatus)
r.delete('/:id', auth(), requireRole('admin'), c.remove)

export default r
