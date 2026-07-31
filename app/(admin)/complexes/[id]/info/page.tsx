'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import toast, { Toaster } from 'react-hot-toast';
import { Eye, EyeOff } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

export default function ComplexInfoPage() {
  const params = useParams();
  const router = useRouter();
  const complexId = params.id as string;

  const [name, setName] = useState('');
  const [complexUrl, setComplexUrl] = useState('');
  const [enamad, setEnamad] = useState('');
  const [rahaPalBearer, setRahaPalBearer] = useState('');
  const [paymentKey, setPaymentKey] = useState('');
  const [showSecrets, setShowSecrets] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch(`/api/admin/complexes/${complexId}`, { credentials: 'include' })
      .then(async (res) => {
        if (res.status === 401 || res.status === 403) {
          router.push('/login');
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (!data) return;
        if (data.error) {
          toast.error(data.error);
          return;
        }
        const complex = data.complex;
        setName(complex.name ?? '');
        setComplexUrl(complex.complexUrl ?? '');
        setEnamad(complex.enamad ?? '');
        setRahaPalBearer(complex.rahaPalBearer ?? '');
        setPaymentKey(complex.paymentKey ?? '');
      })
      .catch(() => {
        toast.error('خطا در دریافت اطلاعات مجموعه');
      })
      .finally(() => setLoading(false));
  }, [complexId, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await fetch(`/api/admin/complexes/${complexId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name,
          complexUrl,
          enamad,
          rahaPalBearer,
          paymentKey,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'خطا در ذخیره اطلاعات مجموعه');
      }

      toast.success('اطلاعات مجموعه با موفقیت ذخیره شد');
    } catch (error: any) {
      toast.error(error.message || 'خطا در ذخیره اطلاعات مجموعه');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4 sm:space-y-6 min-h-screen">
        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 text-center text-gray-600">
          در حال بارگذاری...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 min-h-screen">
      <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-6">
          اطلاعات مجموعه
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">نام مجموعه</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              dir="rtl"
              required
              disabled={saving}
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              آدرس دامنه (ComplexUrl)
            </label>
            <Input
              value={complexUrl}
              onChange={(e) => setComplexUrl(e.target.value)}
              placeholder="example.com"
              dir="ltr"
              disabled={saving}
            />
            <p className="text-xs text-gray-500">
              دامنه‌ای که صفحه ورود کاربران روی آن باز می‌شود، برای نمایش نام و نماد این مجموعه.
            </p>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              کد نماد اعتماد الکترونیکی (ENamad)
            </label>
            <Textarea
              value={enamad}
              onChange={(e) => setEnamad(e.target.value)}
              placeholder="<a ...>...</a>"
              dir="ltr"
              disabled={saving}
            />
          </div>

          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-800">اطلاعات درگاه پرداخت</h2>
            <button
              type="button"
              onClick={() => setShowSecrets((prev) => !prev)}
              className="flex items-center gap-1 text-xs text-gray-600 hover:text-gray-800"
            >
              {showSecrets ? <EyeOff size={14} /> : <Eye size={14} />}
              {showSecrets ? 'مخفی کردن' : 'نمایش'}
            </button>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">RahaPalBearer</label>
            <Input
              type={showSecrets ? 'text' : 'password'}
              value={rahaPalBearer}
              onChange={(e) => setRahaPalBearer(e.target.value)}
              dir="ltr"
              autoComplete="off"
              disabled={saving}
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">PaymentKey</label>
            <Input
              type={showSecrets ? 'text' : 'password'}
              value={paymentKey}
              onChange={(e) => setPaymentKey(e.target.value)}
              dir="ltr"
              autoComplete="off"
              disabled={saving}
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full sm:w-auto px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {saving ? 'در حال ذخیره...' : 'ذخیره اطلاعات'}
          </button>
        </form>
      </div>
      <Toaster position="top-center" />
    </div>
  );
}
