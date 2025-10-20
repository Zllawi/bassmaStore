import { Request, Response } from 'express'
import multer from 'multer'
import path from 'path'
import { asyncHandler } from '../../utils/asyncHandler'
import * as svc from './service'
import { parseMaybeNumber } from '../../utils/num'
import { productCreateSchema, productUpdateSchema } from '../../utils/validators'
import { requireRole } from '../../middlewares/auth'

// Local dev uploads: store under uploads/
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, path.resolve(process.cwd(), 'uploads')),
  filename: (_req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
})
export const upload = multer({ storage })

export const list = asyncHandler(async (req: Request, res: Response) => {
  const data = await svc.list(req.query)
  const base = `${req.protocol}://${req.get('host')}`
  const serialize = (p: any) => {
    const obj = (typeof p?.toObject === 'function') ? p.toObject() : p
    if (Array.isArray(obj.images)) {
      obj.images = obj.images.map((u: string) => (typeof u === 'string' && u.startsWith('/uploads/')) ? `${base}${u}` : u)
    }
    return obj
  }
  res.json({ data: Array.isArray(data) ? data.map(serialize) : [] })
})

export const getOne = asyncHandler(async (req: Request, res: Response) => {
  const data = await svc.byId(req.params.id)
  if (!data) return res.status(404).json({ message: 'Not found' })
  const base = `${req.protocol}://${req.get('host')}`
  const obj = (typeof (data as any)?.toObject === 'function') ? (data as any).toObject() : data
  if (Array.isArray((obj as any).images)) {
    (obj as any).images = (obj as any).images.map((u: string) => (typeof u === 'string' && u.startsWith('/uploads/')) ? `${base}${u}` : u)
  }
  res.json({ data: obj })
})

export const create = [requireRole('admin'), asyncHandler(async (req: Request, res: Response) => {
  // Coerce numeric values from multipart text while avoiding NaN injection
  const input = {
    ...req.body,
    price: parseMaybeNumber((req.body as any).price),
    stock: parseMaybeNumber((req.body as any).stock),
    discount: parseMaybeNumber((req.body as any).discount)
  }

  const parsed = productCreateSchema.safeParse(input)
  if (!parsed.success) {
    return res.status(400).json({ message: 'Invalid product payload', issues: parsed.error.issues })
  }

  const files = (req as any).files as Express.Multer.File[] | undefined
  const images = files?.map(f => '/uploads/' + path.basename(f.path)) || []
  const body = parsed.data
  const data = await svc.create({ ...body, images: images.length ? images : body.images })
  const base = `${req.protocol}://${req.get('host')}`
  const obj = (typeof (data as any)?.toObject === 'function') ? (data as any).toObject() : data
  if (Array.isArray((obj as any).images)) {
    (obj as any).images = (obj as any).images.map((u: string) => (typeof u === 'string' && u.startsWith('/uploads/')) ? `${base}${u}` : u)
  }
  res.status(201).json({ data: obj })
})]

export const update = [requireRole('admin'), asyncHandler(async (req: Request, res: Response) => {
  // Accept multipart as well; merge/replace images based on query
  const files = (req as any).files as Express.Multer.File[] | undefined

  // Coerce numeric inputs BEFORE validation to avoid Zod type errors on multipart text values
  const input = {
    ...req.body,
    price: parseMaybeNumber((req.body as any).price),
    stock: parseMaybeNumber((req.body as any).stock),
    discount: parseMaybeNumber((req.body as any).discount)
  }

  // Validate after coercion
  const parsed = productUpdateSchema.safeParse(input)
  if (!parsed.success) {
    return res.status(400).json({ message: 'Invalid product update payload', issues: parsed.error.issues })
  }
  let updateBody: any = { ...parsed.data }

  if (files && files.length) {
    const images = files.map(f => '/uploads/' + path.basename(f.path))
    const action = (req.query.imagesAction as string) || 'append'
    if (action === 'replace') updateBody.images = images
    else if (action === 'append') {
      // Merge with existing images
      const current = await svc.byId(req.params.id)
      const existing = (current as any)?.images || []
      updateBody.images = [...existing, ...images]
    }
  }

  const data = await svc.update(req.params.id, updateBody)
  const base = `${req.protocol}://${req.get('host')}`
  const obj = (typeof (data as any)?.toObject === 'function') ? (data as any).toObject() : data
  if (Array.isArray((obj as any).images)) {
    (obj as any).images = (obj as any).images.map((u: string) => (typeof u === 'string' && u.startsWith('/uploads/')) ? `${base}${u}` : u)
  }
  res.json({ data: obj })
})]

export const remove = [requireRole('admin'), asyncHandler(async (req: Request, res: Response) => {
  await svc.remove(req.params.id)
  res.status(204).send()
})]
