const PAYSTACK_PUBLIC_KEY = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || "";

interface PaystackOptions {
  email: string;
  amount: number; // in pesewas (GHS * 100)
  plan: string;
  onSuccess: (reference: string) => void;
  onClose: () => void;
}

export function initializePaystack({ email, amount, plan, onSuccess, onClose }: PaystackOptions) {
  if (!PAYSTACK_PUBLIC_KEY) {
    throw new Error("Paystack public key not configured. Set VITE_PAYSTACK_PUBLIC_KEY.");
  }

  const handler = (window as any).PaystackPop.setup({
    key: PAYSTACK_PUBLIC_KEY,
    email,
    amount,
    currency: "GHS",
    metadata: { plan },
    callback: (response: { reference: string }) => {
      onSuccess(response.reference);
    },
    onClose,
  });

  handler.openIframe();
}
