export type IntegrationEvent = 'order.created'|'user.registered'

export async function send(event: IntegrationEvent, payload: any) {
  // Hook for future SMS/Email/Webhooks integrations
  console.log('[integration]', event, payload)
}

