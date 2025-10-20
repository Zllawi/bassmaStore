import { Request, Response } from 'express'
import { asyncHandler } from '../../utils/asyncHandler'
import { usersRepo } from '../../repo'

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
