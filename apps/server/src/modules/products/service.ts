import slugify from 'slugify'
import { productsRepo } from '../../repo'

export async function list(query: any) { return productsRepo.list(query) }

export async function byId(id: string) { return productsRepo.byId(id) }

export async function create(input: any) {
  const slug = slugify(input.name, { lower: true, strict: true }) + '-' + Math.random().toString(36).slice(2,6)
  return productsRepo.create({ ...input, slug } as any)
}

export async function update(id: string, input: any) { return productsRepo.update(id, input) }

export async function remove(id: string) { return productsRepo.remove(id) }
