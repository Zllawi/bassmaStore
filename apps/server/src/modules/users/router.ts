import { Router } from 'express'
import { auth, requireRole } from '../../middlewares/auth'
import * as c from './controller'

const r = Router()

r.get('/', auth(), requireRole('admin'), c.list)
r.patch('/:id', auth(), requireRole('admin'), c.update)
r.delete('/:id', auth(), requireRole('admin'), c.remove)

export default r

// Current user addresses
r.get('/me/addresses', auth(), c.myAddresses)
r.post('/me/addresses', auth(), c.addAddress)
r.patch('/me/addresses/:id', auth(), c.updateAddress)
r.delete('/me/addresses/:id', auth(), c.deleteAddress)
r.patch('/me/addresses/:id/default', auth(), c.setDefaultAddress)
