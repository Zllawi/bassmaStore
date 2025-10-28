import { Request, Response } from 'express'
import { asyncHandler } from '../../utils/asyncHandler'
import { usersRepo } from '../../repo'
import mongoose from 'mongoose'
import { User } from '../auth/model'

export const list = asyncHandler(async (_req: Request, res: Response) => {
  const data = await usersRepo.findAll()
  res.json({ data })
})

export const update = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params
  const data = await usersRepo.updateById(id, req.body)
  res.json({ data })
})

export const remove = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params
  await usersRepo.deleteById(id)
  res.status(204).send()
})

// Addresses for current user
export const myAddresses = asyncHandler(async (req: Request, res: Response) => {
  const uid = req.user!.id
  let u = await usersRepo.findById(uid) as any
  let addresses = (u as any)?.addresses || []
  // If user has legacy address data but no addresses array, create a default one once
  if ((!addresses || addresses.length === 0) && (u?.phone || u?.city || u?.region || u?.addressDescription)) {
    const composed = [u?.city, u?.region, u?.addressDescription].filter(Boolean).join(' - ')
    const a: any = {
      id: new mongoose.Types.ObjectId().toString(),
      label: 'العنوان الأساسي',
      name: u?.name || '',
      phone: u?.phone || '',
      city: u?.city || '',
      region: u?.region || '',
      address: composed || u?.addressDescription || '',
      addressDescription: u?.addressDescription || '',
      isDefault: true
    }
    await usersRepo.updateById(uid, { $push: { addresses: a } } as any)
    u = await usersRepo.findById(uid) as any
    addresses = u?.addresses || []
  }
  // Ensure each address has an id; repair if needed
  let repaired = false
  const fixed = (addresses || []).map((a: any) => {
    if (!a?.id || String(a.id).trim() === '') {
      repaired = true
      return { ...a, id: new mongoose.Types.ObjectId().toString() }
    }
    return a
  })
  if (repaired) {
    await usersRepo.updateById(uid, { addresses: fixed } as any)
    const nu = await usersRepo.findById(uid) as any
    return res.json({ data: (nu?.addresses || []) })
  }
  res.json({ data: addresses })
})

export const addAddress = asyncHandler(async (req: Request, res: Response) => {
  const uid = req.user!.id
  const id = new mongoose.Types.ObjectId().toString()
  // Never allow client to override server-generated id
  const { id: _ignoredId, ...rest } = req.body as any
  const a = { ...rest, id }
  const u = await usersRepo.updateById(uid, { $push: { addresses: a } } as any)
  const addresses = (u as any)?.addresses || []
  res.status(201).json({ data: addresses })
})

export const updateAddress = asyncHandler(async (req: Request, res: Response) => {
  const uid = req.user!.id
  const { id } = req.params
  // update that matches subdocument by id
  // Prevent updating the id field
  const entries = Object.entries(req.body).filter(([k]) => k !== 'id')
  await User.findByIdAndUpdate(uid, {
    $set: Object.fromEntries(entries.map(([k,v]) => ([`addresses.$[el].${k}`, v])))
  }, { arrayFilters: [{ 'el.id': id }] })
  const u = await usersRepo.findById(uid)
  res.json({ data: (u as any)?.addresses || [] })
})

export const deleteAddress = asyncHandler(async (req: Request, res: Response) => {
  const uid = req.user!.id
  const { id } = req.params
  await usersRepo.updateById(uid, { $pull: { addresses: { id } } } as any)
  const u = await usersRepo.findById(uid)
  res.json({ data: (u as any)?.addresses || [] })
})

export const setDefaultAddress = asyncHandler(async (req: Request, res: Response) => {
  const uid = req.user!.id
  const { id } = req.params
  // First unset all, then set chosen default
  await User.findByIdAndUpdate(uid, { $set: { 'addresses.$[].isDefault': false } })
  await User.findByIdAndUpdate(uid, { $set: { 'addresses.$[el].isDefault': true } }, { arrayFilters: [{ 'el.id': id }] })
  const u = await usersRepo.findById(uid)
  res.json({ data: (u as any)?.addresses || [] })
})
