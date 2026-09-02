export function formatCurrency(amount: number, currency = 'INR'): string {
  if (isNaN(amount) || amount === null || amount === undefined) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: currency,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatProbability(probability: number | null | undefined): string {
  if (probability === null || probability === undefined || isNaN(probability)) return 'N/A';
  return `${(probability * 100).toFixed(1)}%`;
}

export function formatDate(dateString: string): string {
  if (!dateString) return 'Just now';
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-IN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }).format(date);
  } catch {
    return dateString;
  }
}

export function formatFailureReason(reason: string | null | undefined): string {
  if (!reason) return 'Unknown Error';
  const mapping: Record<string, string> = {
    insufficient_funds: 'Insufficient Funds',
    bank_declined: 'Bank Declined',
    timeout: 'Gateway Timeout',
    network_error: 'Network Failure',
    limit_exceeded: 'Card/UPI Limit Exceeded',
  };
  return mapping[reason] || reason.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

export function formatPaymentMethod(method: string | null | undefined): string {
  if (!method) return 'UPI';
  const mapping: Record<string, string> = {
    upi: 'UPI AutoPay',
    card: 'Credit / Debit Card',
    netbanking: 'NetBanking',
    wallet: 'Prepaid Wallet',
  };
  return mapping[method.toLowerCase()] || method.toUpperCase();
}

export function formatActionType(action: string | null | undefined): string {
  if (!action) return 'No Action';
  const mapping: Record<string, string> = {
    retry_payment: 'Smart Payment Retry',
    alternative_payment: 'Alternative Payment Nudge',
    customer_notification: 'Hinglish WhatsApp / SMS Alert',
    manual_review: 'Ops Manual Escalation',
    no_action: 'Bounded Stop (No Action)',
  };
  return mapping[action] || action.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}
