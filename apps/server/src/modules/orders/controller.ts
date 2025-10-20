import { Request, Response } from 'express'
import { asyncHandler } from '../../utils/asyncHandler'
import { orderCreateSchema } from '../../utils/validators'
import { usersRepo } from '../../repo'
import * as service from './service'
import * as svc from './service'

export const create = asyncHandler(async (req: Request, res: Response) => {
  const body = orderCreateSchema.parse(req.body)
  const userId = req.user!.id
  let customerName = body.customerName
  let customerPhone = body.customerPhone
  let city = body.city as any
  let region = (body as any).region as any
  let addressDescription = (body as any).addressDescription as any
  let address = body.address
  if (!customerName || !customerPhone || !city || !region || !addressDescription || !address) {
    const u: any = await usersRepo.findById(userId)
    customerName = customerName || u?.name
    customerPhone = customerPhone || u?.phone
    city = city || u?.city
    region = region || u?.region
    addressDescription = addressDescription || u?.addressDescription
    // Compose a readable address from user profile if not explicitly provided
    const composed = [u?.city, u?.region, u?.addressDescription].filter(Boolean).join(' - ')
    address = address || composed
  }
  if (!address) return res.status(422).json({ message: 'لا يوجد عنوان محفوظ في الحساب. يرجى استكمال بيانات العنوان في ملفك الشخصي.' })
  const data = await svc.create({ ...body, address, userId, customerName, customerPhone, city, region, addressDescription })
  res.status(201).json({ message: 'تم إرسال الطلب بنجاح', data })
})

export const mine = asyncHandler(async (req: Request, res: Response) => {
  const data = await svc.mine(req.user!.id)
  res.json({ data })
})

export const getOne = asyncHandler(async (req: Request, res: Response) => {
  const data = await svc.byId(req.params.id)
  if (!data) return res.status(404).json({ message: 'Not found' })
  res.json({ data })
})

export const updateStatus = asyncHandler(async (req: Request, res: Response) => {
  const data = await svc.updateStatus(req.params.id, req.body.status)
  res.json({ data })
})

export const list = asyncHandler(async (req: Request, res: Response) => {
  if (req.query.stats) return res.json(await svc.stats())
  const data = await service.list(req.query)
  res.json({ data })
})

export const update = asyncHandler(async (req: Request, res: Response) => {
  const data = await service.update(req.params.id, req.body)
  res.json({ data })
})

export const remove = asyncHandler(async (req: Request, res: Response) => {
  await service.remove(req.params.id)
  res.status(204).send()
})
