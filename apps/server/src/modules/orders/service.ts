import { ordersRepo, productsRepo } from '../../repo'
import { nextSeq, formatInvoice } from '../../utils/sequence'

export async function create(order: any) {
  const items = await Promise.all((order.items || []).map(async (it: any) => {
    if (!it?.name && it?.productId) {
      try {
        const p: any = await productsRepo.byId(it.productId)
        return { ...it, name: p?.name }
      } catch {
        return it
      }
    }
    return it
  }))
  let invoiceRef = (order as any).invoiceRef
  if (!invoiceRef) {
    const seq = await nextSeq('order_invoice')
    invoiceRef = formatInvoice(seq, 4)
  }
  return ordersRepo.create({ ...order, items, invoiceRef })
}

export async function mine(userId: string) { return ordersRepo.mine(userId) }

export async function list(filter: any) { return ordersRepo.list(filter) }

export async function byId(id: string) { return ordersRepo.byId(id) }

export async function updateStatus(id: string, status: string) { return ordersRepo.updateStatus(id, status) }

export async function update(id: string, input: any) {
  const allowed: any = {}
  if (input.status) allowed.status = input.status
  if (typeof input.invoiceRef !== 'undefined') allowed.invoiceRef = input.invoiceRef
  return ordersRepo.update(id, allowed)
}

export async function stats() { return ordersRepo.stats() }

export async function remove(id: string) {
  const Order = (await import('./model')).Order
  await Order.findByIdAndDelete(id)
  return true
}
