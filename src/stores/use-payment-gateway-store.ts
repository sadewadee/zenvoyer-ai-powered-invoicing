import { create } from 'zustand';
import type { PaymentGatewayState } from '@/types';
export const usePaymentGatewayStore = create<PaymentGatewayState>((set) => ({
  gateways: {
    Xendit: { name: 'Xendit', isEnabled: false, apiKey: '', apiSecret: '' },
    Midtrans: { name: 'Midtrans', isEnabled: false, apiKey: '', apiSecret: '' },
    PayPal: { name: 'PayPal', isEnabled: false, apiKey: '', apiSecret: '' },
    Stripe: { name: 'Stripe', isEnabled: false, apiKey: '', apiSecret: '' },
  },
  updateGateway: (name, settings) => {
    set((state) => ({
      gateways: {
        ...state.gateways,
        [name]: {
          ...state.gateways[name],
          ...settings,
        },
      },
    }));
  },
}));