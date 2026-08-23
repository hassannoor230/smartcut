import { useState, useMemo, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import { ChevronLeft, ChevronRight, Check, Calendar, Clock, User, CreditCard, Scissors, Upload, X } from 'lucide-react';
import api from '../lib/api';
import { useServices, useOpeningHours, useBusiness } from '../hooks/useBusiness';
import type { Service, OpeningHours } from '../types';

const steps = [
  { id: 1, label: 'Service', icon: Scissors },
  { id: 2, label: 'Date', icon: Calendar },
  { id: 3, label: 'Time', icon: Clock },
  { id: 4, label: 'Info', icon: User },
  { id: 5, label: 'Payment', icon: CreditCard },
  { id: 6, label: 'Confirm', icon: Check },
] as const;

const paymentMethods = [
  { id: 'cash' as const, label: 'Cash on Arrival', desc: 'Pay at the salon' },
  { id: 'jazzcash' as const, label: 'JazzCash', desc: 'Mobile wallet' },
  { id: 'easypaisa' as const, label: 'EasyPaisa', desc: 'Mobile wallet' },
  { id: 'card' as const, label: 'Card', desc: 'Credit / Debit card' },
];

function getNextDays(count: number) {
  const days: { date: Date; label: string; value: string }[] = [];
  for (let i = 0; i < count; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    days.push({
      date: d,
      label: d.toLocaleDateString('en-PK', { weekday: 'short', day: 'numeric', month: 'short' }),
      value: d.toISOString().split('T')[0],
    });
  }
  return days;
}

function getTimeSlots(dateStr: string, openingHours: OpeningHours | undefined) {
  if (!openingHours) return [];
  const date = new Date(dateStr + 'T00:00:00');
  const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'] as const;
  const dayKey = dayNames[date.getDay()];
  const dayHours = (openingHours as unknown as Record<string, { isOpen: boolean; openTime?: string; closeTime?: string }>)[dayKey];

  if (!dayHours?.isOpen || !dayHours.openTime || !dayHours.closeTime) return [];

  const slots: string[] = [];
  const [openH, openM] = dayHours.openTime.split(':').map(Number);
  const [closeH, closeM] = dayHours.closeTime.split(':').map(Number);

  let current = openH * 60 + openM;
  const end = closeH * 60 + closeM;

  while (current < end) {
    const h = Math.floor(current / 60);
    const m = current % 60;
    slots.push(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`);
    current += 30;
  }

  return slots;
}

export default function BookAppointmentPage() {
  const { data: services } = useServices();
  const { data: openingHours } = useOpeningHours();
  const { data: business } = useBusiness();
  const [step, setStep] = useState(1);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'jazzcash' | 'easypaisa' | 'card'>('cash');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    customerName: '',
    phone: '',
    customerEmail: '',
    message: '',
  });

  const nextDays = useMemo(() => getNextDays(14), []);
  const timeSlots = useMemo(() => getTimeSlots(selectedDate, openingHours), [selectedDate, openingHours]);

  const updateForm = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const validateStep = (s: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (s === 4) {
      if (!form.customerName.trim() || form.customerName.trim().length < 2) {
        newErrors.customerName = 'Name is required';
      }
      if (!form.phone.trim() || form.phone.trim().length < 10) {
        newErrors.phone = 'Valid phone required';
      }
      if (form.customerEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.customerEmail)) {
        newErrors.customerEmail = 'Valid email required';
      }
    }

    if (s === 5) {
      if (!paymentMethod) {
        newErrors.paymentMethod = 'Please select a payment method';
      }
      if (paymentMethod !== 'cash' && !receiptFile) {
        newErrors.receipt = 'Please upload payment receipt';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const goNext = () => {
    if (!validateStep(step)) return;
    if (step < 6) setStep(step + 1);
  };

  const goBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const formatPrice = (price: number | null) => {
    if (!price) return 'Price on request';
    return `Rs. ${price.toLocaleString()}`;
  };

  const selectedServicePrice = selectedService?.price;
  const selectedServiceDuration = selectedService?.duration;
  const selectedDayLabel = nextDays.find((d) => d.value === selectedDate)?.label || '';

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setReceiptFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setReceiptPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      if (errors.receipt) {
        setErrors((prev) => {
          const next = { ...prev };
          delete next.receipt;
          return next;
        });
      }
    }
  };

  const uploadReceipt = async (): Promise<{ url: string; publicId: string } | null> => {
    if (!receiptFile) return null;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('receipt', receiptFile);
      const { data } = await api.post('/upload-receipt', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return data.data;
    } catch {
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handlePaymentConfirm = async () => {
    if (!receiptFile) {
      setErrors((prev) => ({ ...prev, receipt: 'Please upload a receipt' }));
      return;
    }
    const result = await uploadReceipt();
    if (result) {
      setForm((prev) => ({ ...prev, paymentReceipt: result.url, paymentReceiptPublicId: result.publicId }));
      setShowPaymentModal(false);
      goNext();
    } else {
      setErrors((prev) => ({ ...prev, upload: 'Upload failed. Please try again.' }));
    }
  };

  const handleSubmit = async () => {
    if (!validateStep(4) || !validateStep(5)) return;

    setStatus('loading');
    try {
      const payload: Record<string, unknown> = {
        customerName: form.customerName,
        phone: form.phone,
        customerEmail: form.customerEmail || undefined,
        serviceId: selectedService?._id || undefined,
        serviceName: selectedService?.name,
        preferredDate: selectedDate,
        preferredTime: selectedTime,
        message: form.message || undefined,
        paymentMethod,
        paymentReceipt: (form as any).paymentReceipt || undefined,
        paymentReceiptPublicId: (form as any).paymentReceiptPublicId || undefined,
      };
      await api.post('/appointments', payload);
      setStatus('success');
    } catch {
      setStatus('error');
    }
  };

  if (status === 'success') {
    return (
      <>
        <Helmet>
          <title>Appointment Confirmed | Smartcut Rahwali Gujranwala</title>
        </Helmet>
        <section className="section-padding">
          <div className="container-narrow max-w-xl">
            <div className="bg-surface border border-accent/30 p-8 rounded-sm text-center">
              <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
                <Check className="text-green-500" size={32} />
              </div>
              <h2 className="font-heading text-2xl text-accent mb-3">APPOINTMENT CONFIRMED</h2>
              <p className="text-light-muted mb-2">
                Your appointment request has been received. Smartcut will confirm availability shortly.
              </p>
              <p className="text-light-muted text-sm mb-6">
                A confirmation email has been sent to your inbox.
              </p>
              <button
                onClick={() => {
                  setStatus('idle');
                  setStep(1);
                  setSelectedService(null);
                  setSelectedDate('');
                  setSelectedTime('');
                  setPaymentMethod('cash');
                  setForm({ customerName: '', phone: '', customerEmail: '', message: '' });
                  setErrors({});
                  setReceiptPreview(null);
                  setReceiptFile(null);
                  setShowPaymentModal(false);
                }}
                className="btn-secondary"
              >
                Book Another
              </button>
            </div>
          </div>
        </section>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>Book Appointment | Smartcut Rahwali Gujranwala</title>
      </Helmet>
      <section className="section-padding">
        <div className="container-narrow max-w-2xl">
          <p className="text-accent text-sm tracking-widest uppercase mb-2">Appointments</p>
          <h1 className="font-heading text-section text-light-text mb-2">BOOK APPOINTMENT</h1>
          <p className="text-light-muted text-sm mb-8">
            Follow the steps below to book your appointment.
          </p>

          <div className="flex items-center justify-between mb-10">
            {steps.map((s, idx) => (
              <div key={s.id} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors ${
                      step >= s.id
                        ? 'bg-accent border-accent text-primary'
                        : 'border-surface text-light-muted'
                    }`}
                  >
                    {step > s.id ? <Check size={18} /> : <s.icon size={18} />}
                  </div>
                  <span
                    className={`text-xs mt-1.5 ${
                      step >= s.id ? 'text-accent' : 'text-light-muted'
                    }`}
                  >
                    {s.label}
                  </span>
                </div>
                {idx < steps.length - 1 && (
                  <div
                    className={`w-8 md:w-16 h-0.5 mx-1 ${
                      step > s.id ? 'bg-accent' : 'bg-surface'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>

          {step === 1 && (
            <div>
              <h2 className="font-heading text-xl text-light-text mb-4">Select a Service</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {services?.map((s) => (
                  <button
                    key={s._id}
                    type="button"
                    onClick={() => {
                      setSelectedService(s);
                      goNext();
                    }}
                    className={`text-left p-4 rounded-sm border transition-colors ${
                      selectedService?._id === s._id
                        ? 'border-accent bg-accent/5'
                        : 'border-surface bg-surface hover:border-accent/50'
                    }`}
                  >
                    <div className="font-medium text-light-text">{s.name}</div>
                    <div className="text-xs text-light-muted mt-1">{s.category}</div>
                    <div className="text-sm text-accent mt-2">{formatPrice(s.price)}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <h2 className="font-heading text-xl text-light-text mb-4">Select a Date</h2>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                {nextDays.map((d) => (
                  <button
                    key={d.value}
                    type="button"
                    onClick={() => {
                      setSelectedDate(d.value);
                      setSelectedTime('');
                      goNext();
                    }}
                    className={`p-3 rounded-sm border text-center transition-colors ${
                      selectedDate === d.value
                        ? 'border-accent bg-accent/5'
                        : 'border-surface bg-surface hover:border-accent/50'
                    }`}
                  >
                    <div className="text-xs text-light-muted">{d.label.split(' ')[0]}</div>
                    <div className="text-lg font-heading text-light-text">{d.label.split(' ')[1]?.replace(',', '')}</div>
                    <div className="text-xs text-light-muted">{d.label.split(' ')[2]}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <h2 className="font-heading text-xl text-light-text mb-1">Select a Time</h2>
              <p className="text-light-muted text-sm mb-4">
                {selectedDayLabel} {selectedDate && `• ${selectedDate}`}
              </p>
              {timeSlots.length === 0 ? (
                <p className="text-light-muted">No available time slots for this date. Please select another date.</p>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {timeSlots.map((slot) => (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => {
                        setSelectedTime(slot);
                        goNext();
                      }}
                      className={`py-2.5 rounded-sm border text-sm transition-colors ${
                        selectedTime === slot
                          ? 'border-accent bg-accent/5 text-accent'
                          : 'border-surface bg-surface text-light-text hover:border-accent/50'
                      }`}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {step === 4 && (
            <div>
              <h2 className="font-heading text-xl text-light-text mb-4">Your Information</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-light-muted mb-1">Full Name *</label>
                  <input
                    value={form.customerName}
                    onChange={(e) => updateForm('customerName', e.target.value)}
                    className="w-full bg-surface border border-surface rounded-sm px-4 py-3 text-light-text focus:border-accent outline-none"
                    placeholder="Enter your full name"
                  />
                  {errors.customerName && <p className="text-red-400 text-xs mt-1">{errors.customerName}</p>}
                </div>
                <div>
                  <label className="block text-sm text-light-muted mb-1">Phone Number *</label>
                  <input
                    value={form.phone}
                    onChange={(e) => updateForm('phone', e.target.value)}
                    className="w-full bg-surface border border-surface rounded-sm px-4 py-3 text-light-text focus:border-accent outline-none"
                    placeholder="+92 3XX XXXXXXX"
                  />
                  {errors.phone && <p className="text-red-400 text-xs mt-1">{errors.phone}</p>}
                </div>
                <div>
                  <label className="block text-sm text-light-muted mb-1">Email (for confirmation)</label>
                  <input
                    value={form.customerEmail}
                    onChange={(e) => updateForm('customerEmail', e.target.value)}
                    className="w-full bg-surface border border-surface rounded-sm px-4 py-3 text-light-text focus:border-accent outline-none"
                    placeholder="your@email.com"
                  />
                  {errors.customerEmail && <p className="text-red-400 text-xs mt-1">{errors.customerEmail}</p>}
                </div>
                <div>
                  <label className="block text-sm text-light-muted mb-1">Message (optional)</label>
                  <textarea
                    value={form.message}
                    onChange={(e) => updateForm('message', e.target.value)}
                    rows={3}
                    className="w-full bg-surface border border-surface rounded-sm px-4 py-3 text-light-text focus:border-accent outline-none resize-none"
                    placeholder="Any special requests..."
                  />
                </div>
              </div>
            </div>
          )}

          {step === 5 && (
            <div>
              <h2 className="font-heading text-xl text-light-text mb-4">Payment Method</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {paymentMethods.map((pm) => (
                  <button
                    key={pm.id}
                    type="button"
                    onClick={() => {
                      setPaymentMethod(pm.id);
                      setErrors((prev) => {
                        const next = { ...prev };
                        delete next.paymentMethod;
                        delete next.receipt;
                        return next;
                      });
                      if (pm.id !== 'cash') {
                        setShowPaymentModal(true);
                      } else {
                        setReceiptPreview(null);
                        setReceiptFile(null);
                        goNext();
                      }
                    }}
                    className={`text-left p-4 rounded-sm border transition-colors ${
                      paymentMethod === pm.id
                        ? 'border-accent bg-accent/5'
                        : 'border-surface bg-surface hover:border-accent/50'
                    }`}
                  >
                    <div className="font-medium text-light-text">{pm.label}</div>
                    <div className="text-xs text-light-muted mt-1">{pm.desc}</div>
                  </button>
                ))}
              </div>
              {errors.paymentMethod && <p className="text-red-400 text-xs mt-2">{errors.paymentMethod}</p>}
              {errors.receipt && <p className="text-red-400 text-xs mt-2">{errors.receipt}</p>}
            </div>
          )}

          {step === 6 && (
            <div>
              <h2 className="font-heading text-xl text-light-text mb-4">Confirm Your Booking</h2>
              <div className="bg-surface border border-surface rounded-sm p-6 space-y-4">
                <div className="flex justify-between py-2 border-b border-surface">
                  <span className="text-light-muted">Service</span>
                  <span className="text-light-text font-medium">{selectedService?.name}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-surface">
                  <span className="text-light-muted">Price</span>
                  <span className="text-light-text font-medium">{formatPrice(selectedServicePrice ?? null)}</span>
                </div>
                {selectedServiceDuration != null && (
                  <div className="flex justify-between py-2 border-b border-surface">
                    <span className="text-light-muted">Duration</span>
                    <span className="text-light-text font-medium">{selectedServiceDuration} min</span>
                  </div>
                )}
                <div className="flex justify-between py-2 border-b border-surface">
                  <span className="text-light-muted">Date</span>
                  <span className="text-light-text font-medium">{selectedDayLabel}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-surface">
                  <span className="text-light-muted">Time</span>
                  <span className="text-light-text font-medium">{selectedTime}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-surface">
                  <span className="text-light-muted">Name</span>
                  <span className="text-light-text font-medium">{form.customerName || '-'}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-surface">
                  <span className="text-light-muted">Phone</span>
                  <span className="text-light-text font-medium">{form.phone || '-'}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-surface">
                  <span className="text-light-muted">Email</span>
                  <span className="text-light-text font-medium">{form.customerEmail || '-'}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-surface">
                  <span className="text-light-muted">Payment</span>
                  <span className="text-light-text font-medium capitalize">{paymentMethod}</span>
                </div>
                {form.message && (
                  <div className="flex justify-between py-2 border-b border-surface">
                    <span className="text-light-muted">Message</span>
                    <span className="text-light-text font-medium text-right max-w-xs">{form.message}</span>
                  </div>
                )}
              </div>
              <p className="text-light-muted text-xs mt-4">
                By confirming, you agree that Smartcut will contact you to confirm availability. This is not an instant confirmation.
              </p>
            </div>
          )}

          {status === 'error' && (
            <p className="text-red-400 text-sm mt-4">Something went wrong. Please try again.</p>
          )}

          <div className="flex justify-between mt-8">
            <button
              type="button"
              onClick={goBack}
              disabled={step === 1}
              className={`btn-secondary flex items-center gap-1 ${step === 1 ? 'opacity-0 pointer-events-none' : ''}`}
            >
              <ChevronLeft size={18} />
              Back
            </button>

            {step < 6 ? (
              <button
                type="button"
                onClick={goNext}
                className="btn-primary flex items-center gap-1"
              >
                Next
                <ChevronRight size={18} />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={status === 'loading'}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {status === 'loading' ? 'Confirming...' : 'CONFIRM BOOKING'}
              </button>
            )}
          </div>
        </div>
      </section>

      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
          <div className="bg-primary border border-surface rounded-sm p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-heading text-xl text-light-text">Upload Payment Receipt</h3>
              <button
                type="button"
                onClick={() => setShowPaymentModal(false)}
                className="text-light-muted hover:text-light-text"
              >
                <X size={20} />
              </button>
            </div>
            <p className="text-light-muted text-sm mb-4">
              Please upload your payment receipt for {paymentMethods.find(pm => pm.id === paymentMethod)?.label}. 
              Accepted formats: JPG, PNG.
            </p>

            {receiptPreview && (
              <div className="mb-4 relative">
                <img
                  src={receiptPreview}
                  alt="Receipt preview"
                  className="w-full h-48 object-cover rounded-sm border border-surface"
                />
                <button
                  type="button"
                  onClick={() => {
                    setReceiptPreview(null);
                    setReceiptFile(null);
                    if (fileInputRef.current) fileInputRef.current.value = '';
                  }}
                  className="absolute top-2 right-2 bg-black/50 text-white p-1 rounded-full hover:bg-black/70"
                >
                  <X size={16} />
                </button>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />

            {!receiptPreview && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full border-2 border-dashed border-surface rounded-sm p-6 flex flex-col items-center justify-center gap-2 hover:border-accent/50 transition-colors mb-4"
              >
                <Upload className="text-light-muted" size={32} />
                <span className="text-light-muted text-sm">Click to upload receipt</span>
              </button>
            )}

            {errors.upload && <p className="text-red-400 text-xs mb-3">{errors.upload}</p>}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowPaymentModal(false);
                  setPaymentMethod('cash');
                  setReceiptPreview(null);
                  setReceiptFile(null);
                }}
                className="btn-secondary flex-1"
                disabled={uploading}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handlePaymentConfirm}
                disabled={!receiptFile || uploading}
                className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploading ? 'Uploading...' : 'Confirm & Continue'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
