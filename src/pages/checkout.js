import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import api from '../services/api';
import { clearCart, getCart } from '../services/cartClient';
import { pushToast } from '../stores/toastStore';
import { formatCurrency } from '../utils/format';
import { getPublicToken } from '../utils/auth';

const emptyAddress = {
  name: '',
  phone: '',
  addressLine1: '',
  addressLine2: '',
  city: '',
  state: '',
  pincode: '',
  landmark: '',
  alternatePhone: '',
};

function normalizeAddress(address) {
  return {
    id: address.id,
    name: address.name || '',
    phone: address.phone || '',
    addressLine1: address.addressLine1 || '',
    addressLine2: address.addressLine2 || '',
    city: address.city || '',
    state: address.state || '',
    pincode: address.pincode || '',
    landmark: address.landmark || '',
    alternatePhone: address.alternatePhone || '',
    isDefault: Boolean(address.isDefault),
  };
}

export default function CheckoutPage() {
  const router = useRouter();
  const [cart, setCart] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [saveAddress, setSaveAddress] = useState(true);
  const [whatsappUpdates, setWhatsappUpdates] = useState(true);
  const [loading, setLoading] = useState(false);
  const [customer, setCustomer] = useState({ name: '', email: '', phone: '' });
  const [delivery, setDelivery] = useState(emptyAddress);
  const [couponCode, setCouponCode] = useState('');
  const [couponMeta, setCouponMeta] = useState(null);
  const [couponLoading, setCouponLoading] = useState(false);

  const hasProductItems = useMemo(
    () => cart.some((item) => item.itemType === 'PRODUCT'),
    [cart]
  );

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);

    const bootstrap = async () => {
      try {
        const items = await getCart();
        if (!items.length) {
          router.push('/cart');
          return;
        }
        setCart(items);

        try {
          const response = await api.get('/addresses');
          const savedAddresses = response.data || [];
          setAddresses(savedAddresses);

          const defaultAddress = savedAddresses.find((item) => item.isDefault) || savedAddresses[0];
          if (defaultAddress) {
            setSelectedAddressId(defaultAddress.id);
            setDelivery(normalizeAddress(defaultAddress));
            setCustomer((current) => ({
              ...current,
              name: current.name || defaultAddress.name || '',
              phone: current.phone || defaultAddress.phone || '',
            }));
          }
        } catch (error) {
          setAddresses([]);
        }
      } catch (error) {
        router.push('/cart');
      }
    };

    bootstrap();

    return () => {
      document.body.removeChild(script);
    };
  }, [router]);

  const total = useMemo(
    () => cart.reduce((sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 1), 0),
    [cart]
  );

  const discountAmount = Number(couponMeta?.pricing?.discountAmount || 0);
  const taxPercent = 18;
  const taxableAmount = Math.max(0, Number(total || 0) - discountAmount);
  const taxAmount = Number(((taxableAmount * taxPercent) / 100).toFixed(2));
  const grandTotal = Number((taxableAmount + taxAmount).toFixed(2));

  const applyCoupon = async () => {
    const normalizedCode = String(couponCode || '').trim().toUpperCase();
    if (!normalizedCode) {
      setCouponMeta(null);
      return;
    }

    setCouponLoading(true);
    try {
      const response = await api.post('/coupons/validate', {
        code: normalizedCode,
        subtotal: total,
      }, { meta: { scope: 'public' } });

      if (!response.success) {
        throw new Error(response.message || 'Coupon is not valid');
      }

      setCouponCode(normalizedCode);
      setCouponMeta(response.data || null);
      pushToast({
        title: 'Coupon applied',
        description: response.message || 'Discount has been applied.',
        type: 'success',
      });
    } catch (error) {
      setCouponMeta(null);
      pushToast({
        title: 'Coupon invalid',
        description: error.message || 'Unable to apply this coupon right now.',
        type: 'warning',
      });
    } finally {
      setCouponLoading(false);
    }
  };

  const handleDeliveryChange = (field, value) => {
    setSelectedAddressId('');
    setDelivery((current) => ({ ...current, [field]: value }));
  };

  const handleSelectSavedAddress = (address) => {
    setSelectedAddressId(address.id);
    setDelivery(normalizeAddress(address));
    setCustomer((current) => ({
      ...current,
      name: current.name || address.name || '',
      phone: current.phone || address.phone || '',
    }));
  };

  const validateDelivery = () => {
    if (!hasProductItems) {
      return true;
    }

    if (selectedAddressId) {
      return true;
    }

    const requiredFields = ['name', 'phone', 'addressLine1', 'city', 'state', 'pincode'];
    const hasMissingField = requiredFields.some((field) => !String(delivery[field] || '').trim());

    if (hasMissingField) {
      pushToast({
        title: 'Delivery address required',
        description: 'Please complete the delivery address for book orders.',
        type: 'warning',
      });
      return false;
    }

    return true;
  };

  const handlePayment = async () => {
    const token = getPublicToken();

    if (!token) {
      pushToast({
        title: 'Sign in required',
        description: 'Please log in to continue checkout.',
        type: 'warning',
      });
      router.push('/login?redirect=/checkout');
      return;
    }

    if (!customer.name || !customer.email || !customer.phone) {
      pushToast({
        title: 'Purchaser details missing',
        description: 'Please complete your name, email, and phone before paying.',
        type: 'warning',
      });
      return;
    }

    if (!validateDelivery()) {
      return;
    }

    setLoading(true);
    try {
      const orderResponse = await api.post('/orders', {
        customer,
        delivery: {
          addressId: hasProductItems && selectedAddressId ? selectedAddressId : null,
          saveAddress: hasProductItems ? saveAddress : false,
          whatsappUpdates,
          address: hasProductItems && !selectedAddressId ? delivery : null,
        },
        pricing: {
          couponCode: couponMeta?.coupon?.code || null,
        },
        items: cart.map((item) => ({
          itemType: item.itemType,
          productId: item.productId,
          testSeriesId: item.testSeriesId,
          quantity: item.quantity,
        })),
      });

      const paymentResponse = await api.post('/payment/create-order', {
        orderId: orderResponse.data.id,
      });

      const { razorpayOrder, razorpayKeyId } = paymentResponse.data;
      const resolvedRazorpayKey = razorpayKeyId || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
      if (!resolvedRazorpayKey) {
        throw new Error('Payment gateway is not configured. Please contact support.');
      }

      const options = {
        key: resolvedRazorpayKey,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        name: 'RJ Concept',
        description: 'Store & Test Series Checkout',
        order_id: razorpayOrder.id,
        handler: async (response) => {
          await api.post('/payment/verify', {
            ...response,
            orderId: orderResponse.data.id,
          });
          await clearCart();
          pushToast({
            title: 'Payment successful',
            description: 'Your order has been placed successfully.',
            type: 'success',
          });
          setLoading(false);
          router.push('/orders');
        },
        modal: {
          ondismiss: async () => {
            await api.post('/payment/cancel', {
              orderId: orderResponse.data.id,
              reason: 'Payment window dismissed before completion',
              status: 'CANCELLED',
            }).catch(() => null);
            pushToast({
              title: 'Payment not completed',
              description: 'You closed the payment window before finishing the payment.',
              type: 'warning',
            });
            setLoading(false);
          },
        },
        prefill: customer,
        theme: { color: '#2563EB' },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.on('payment.failed', async (response) => {
        const reason = response?.error?.description || response?.error?.reason || 'Payment failed on Razorpay.';
        await api.post('/payment/cancel', {
          orderId: orderResponse.data.id,
          reason,
          status: 'FAILED',
        }).catch(() => null);
        pushToast({
          title: 'Payment failed',
          description: reason,
          type: 'error',
        });
        setLoading(false);
      });
      razorpay.open();
    } catch (error) {
      pushToast({
        title: 'Checkout failed',
        description: error.message || 'Unable to start payment right now.',
        type: 'error',
      });
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto max-w-6xl px-4 py-12">
      <h1 className="text-4xl font-extrabold text-slate-900">Checkout</h1>
      <div className="mt-8 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="space-y-6">
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900">Purchaser Details</h2>
            <div className="mt-4 grid gap-4">
              <input className="rounded-xl border border-slate-200 px-4 py-3" placeholder="Full name" value={customer.name} onChange={(e) => setCustomer({ ...customer, name: e.target.value })} />
              <input className="rounded-xl border border-slate-200 px-4 py-3" placeholder="Email" value={customer.email} onChange={(e) => setCustomer({ ...customer, email: e.target.value })} />
              <input className="rounded-xl border border-slate-200 px-4 py-3" placeholder="Phone" value={customer.phone} onChange={(e) => setCustomer({ ...customer, phone: e.target.value })} />
            </div>
          </section>

          {hasProductItems ? (
            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Delivery Information</h2>
                  <p className="mt-1 text-sm text-slate-500">Book orders need a delivery address. Tests will be activated online after payment.</p>
                </div>
                <label className="inline-flex items-center gap-2 text-sm font-medium text-slate-600">
                  <input type="checkbox" checked={whatsappUpdates} onChange={(e) => setWhatsappUpdates(e.target.checked)} />
                  Send WhatsApp updates
                </label>
              </div>

              {addresses.length ? (
                <div className="mt-5 grid gap-3 md:grid-cols-2">
                  {addresses.map((address) => (
                    <button
                      key={address.id}
                      type="button"
                      onClick={() => handleSelectSavedAddress(address)}
                      className={`rounded-2xl border p-4 text-left transition ${selectedAddressId === address.id ? 'border-blue-600 bg-blue-50' : 'border-slate-200 hover:border-slate-300'}`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <p className="font-semibold text-slate-900">{address.name}</p>
                        {address.isDefault ? <span className="rounded-full bg-slate-900 px-2 py-1 text-[11px] font-semibold text-white">Default</span> : null}
                      </div>
                      <p className="mt-2 text-sm text-slate-600">{address.addressLine1}{address.addressLine2 ? `, ${address.addressLine2}` : ''}</p>
                      <p className="text-sm text-slate-500">{address.city}, {address.state} - {address.pincode}</p>
                      <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-slate-400">{address.phone}</p>
                    </button>
                  ))}
                </div>
              ) : null}

              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <input className="rounded-xl border border-slate-200 px-4 py-3" placeholder="Recipient name" value={delivery.name} onChange={(e) => handleDeliveryChange('name', e.target.value)} />
                <input className="rounded-xl border border-slate-200 px-4 py-3" placeholder="Phone" value={delivery.phone} onChange={(e) => handleDeliveryChange('phone', e.target.value)} />
                <input className="rounded-xl border border-slate-200 px-4 py-3 md:col-span-2" placeholder="Address line 1" value={delivery.addressLine1} onChange={(e) => handleDeliveryChange('addressLine1', e.target.value)} />
                <input className="rounded-xl border border-slate-200 px-4 py-3 md:col-span-2" placeholder="Address line 2 (optional)" value={delivery.addressLine2} onChange={(e) => handleDeliveryChange('addressLine2', e.target.value)} />
                <input className="rounded-xl border border-slate-200 px-4 py-3" placeholder="City" value={delivery.city} onChange={(e) => handleDeliveryChange('city', e.target.value)} />
                <input className="rounded-xl border border-slate-200 px-4 py-3" placeholder="State" value={delivery.state} onChange={(e) => handleDeliveryChange('state', e.target.value)} />
                <input className="rounded-xl border border-slate-200 px-4 py-3" placeholder="Pincode" value={delivery.pincode} onChange={(e) => handleDeliveryChange('pincode', e.target.value)} />
                <input className="rounded-xl border border-slate-200 px-4 py-3" placeholder="Landmark (optional)" value={delivery.landmark} onChange={(e) => handleDeliveryChange('landmark', e.target.value)} />
                <input className="rounded-xl border border-slate-200 px-4 py-3 md:col-span-2" placeholder="Alternate phone (optional)" value={delivery.alternatePhone} onChange={(e) => handleDeliveryChange('alternatePhone', e.target.value)} />
              </div>

              <label className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-slate-600">
                <input type="checkbox" checked={saveAddress} onChange={(e) => setSaveAddress(e.target.checked)} />
                Save this as a reusable address
              </label>
            </section>
          ) : null}
        </div>

        <aside className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900">Order Summary</h2>
          <div className="mt-4 space-y-3">
            {cart.map((item, index) => (
              <div key={`${item.itemType}-${item.id || index}`} className="flex items-center justify-between text-sm text-slate-600">
                <div>
                  <p className="font-medium text-slate-800">{item.name}</p>
                  <p className="text-xs uppercase tracking-wide text-slate-400">{item.itemType === 'PRODUCT' ? 'Book' : 'Test Series'} x {item.quantity || 1}</p>
                </div>
                <span className="font-semibold text-slate-900">{formatCurrency(Number(item.price || 0) * Number(item.quantity || 1))}</span>
              </div>
            ))}
          </div>
          <div className="mt-6 flex items-center justify-between border-t border-slate-200 pt-4">
            <span className="text-sm font-semibold text-slate-600">Subtotal</span>
            <span className="text-lg font-extrabold text-slate-900">{formatCurrency(total)}</span>
          </div>
          <div className="mt-3 space-y-3 rounded-2xl border border-slate-200 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Coupon</p>
            <div className="flex gap-2">
              <input
                type="text"
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                placeholder="Enter coupon code"
                value={couponCode}
                onChange={(event) => setCouponCode(event.target.value.toUpperCase())}
              />
              <button
                type="button"
                disabled={couponLoading}
                className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700"
                onClick={applyCoupon}
              >
                {couponLoading ? 'Checking...' : 'Apply'}
              </button>
            </div>
            <div className="space-y-2 text-sm text-slate-600">
              <div className="flex items-center justify-between">
                <span>Discount</span>
                <span className="font-semibold text-emerald-600">- {formatCurrency(discountAmount)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Tax ({taxPercent}%)</span>
                <span className="font-semibold text-slate-900">{formatCurrency(taxAmount)}</span>
              </div>
              <div className="flex items-center justify-between border-t border-slate-200 pt-2">
                <span className="font-semibold text-slate-700">Grand Total</span>
                <span className="text-xl font-extrabold text-emerald-600">{formatCurrency(grandTotal)}</span>
              </div>
            </div>
          </div>
          <button type="button" disabled={loading} className="mt-6 w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white disabled:opacity-60" onClick={handlePayment}>
            {loading ? 'Processing...' : `Pay ${formatCurrency(grandTotal)}`}
          </button>
        </aside>
      </div>
    </div>
  );
}
