import mongoose, { Schema } from 'mongoose'

type CounterDoc = { key: string; seq: number }

const counterSchema = new Schema<CounterDoc>({
  key: { type: String, required: true, unique: true, index: true },
  seq: { type: Number, default: 0 }
})

const Counter = mongoose.models.__Counter || mongoose.model<CounterDoc>('__Counter', counterSchema)

export async function nextSeq(key: string): Promise<number> {
  const doc = await Counter.findOneAndUpdate(
    { key },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  )
  return doc.seq
}

export function formatInvoice(n: number, width = 4): string {
  return String(n).padStart(width, '0')
}

