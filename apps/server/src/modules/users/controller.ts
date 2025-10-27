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
  const u = await usersRepo.findById(uid)
  const addresses = (u as any)?.addresses || []
  res.json({ data: addresses })
})

export const addAddress = asyncHandler(async (req: Request, res: Response) => {
  const uid = req.user!.id
  const id = new mongoose.Types.ObjectId().toString()
  const a = { id, ...req.body }
  const u = await usersRepo.updateById(uid, { $push: { addresses: a } } as any)
  const addresses = (u as any)?.addresses || []
  res.status(201).json({ data: addresses })
})

export const updateAddress = asyncHandler(async (req: Request, res: Response) => {
  const uid = req.user!.id
  const { id } = req.params
  // update that matches subdocument by id
  await User.findByIdAndUpdate(uid, {
    $set: Object.fromEntries(Object.entries(req.body).map(([k,v]) => ([`addresses.$[el].${k}`, v])))
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
