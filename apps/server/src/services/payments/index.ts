export interface PaymentGateway {
  createIntent: (amount: number, currency?: string) => Promise<{ id: string }>
}

export class DummyGateway implements PaymentGateway {
  async createIntent(amount: number) {
    return { id: 'dummy_' + amount }
  }
}

