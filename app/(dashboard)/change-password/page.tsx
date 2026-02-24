'use client';

import { useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';

export default function ChangePasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!password || !confirmPassword) {
      toast.error('لطفا تمام فیلدها را پر کنید');
      return;
    }

    if (password.length < 6) {
      toast.error('رمز عبور باید حداقل 6 کاراکتر باشد');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('رمزهای عبور یکسان نیستند');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          password,
          confirmPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'خطا در تغییر رمز عبور');
      }

      toast.success('رمز عبور با موفقیت تغییر یافت');
      
      // Reset form
      setPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      console.error('Change password error:', error);
      toast.error(error.message || 'خطا در تغییر رمز عبور. لطفا دوباره تلاش کنید.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">تغییر رمز کاربری</h2>
          <p className="text-gray-600">رمز عبور جدید خود را وارد کنید</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              رمز عبور جدید
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="رمز عبور جدید را وارد کنید"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
              minLength={6}
              required
              dir="rtl"
              disabled={isLoading}
            />
            <p className="mt-1 text-sm text-gray-500">
              رمز عبور باید حداقل 6 کاراکتر باشد
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              تکرار رمز عبور
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="رمز عبور را تکرار کنید"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
              minLength={6}
              required
              dir="rtl"
              disabled={isLoading}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold text-lg disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {isLoading ? 'در حال تغییر...' : 'تغییر رمز عبور'}
          </button>
        </form>
      </div>
      <Toaster position="top-center" />
    </div>
  );
}

