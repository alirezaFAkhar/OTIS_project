'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { verifyOTP, resetPassword } from '@/lib/api';
import toast, { Toaster } from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function VerifyOTPPage() {
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const phone = searchParams.get('phone') || '';
  const type = searchParams.get('type') || 'login';

  useEffect(() => {
    if (!phone) {
      router.push('/login');
    }
  }, [phone, router]);

  const handleCodeChange = (index: number, value: string) => {
    if (value.length > 1) return;
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // Auto focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`code-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      const prevInput = document.getElementById(`code-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleVerify = async () => {
    const otpCode = code.join('');
    if (otpCode.length !== 6) {
      toast.error('لطفا کد 6 رقمی را کامل وارد کنید');
      return;
    }

    setLoading(true);

    try {
      if (type === 'forgot-password') {
        // For forgot password, we don't verify OTP here
        // OTP will be verified when resetting password
        // Just show the password form
        console.log('Forgot password flow - showing password form', { phone, otpCode });
        setShowPasswordForm(true);
        toast.success('لطفا رمز عبور جدید را وارد کنید');
      } else {
        // For login/register, verify and login
        const result = await verifyOTP(phone, otpCode);
        if (result.error) {
          toast.error(result.error);
        } else {
          toast.success(result.message);
          router.push('/dashboard');
        }
      }
    } catch (error) {
      console.error('Verify OTP error:', error);
      toast.error('خطا در ارتباط با سرور');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (password.length < 6) {
      toast.error('رمز عبور باید حداقل 6 کاراکتر باشد');
      return;
    }
    if (password !== confirmPassword) {
      toast.error('رمز عبور و تکرار آن یکسان نیستند');
      return;
    }

    const otpCode = code.join('');
    if (otpCode.length !== 6) {
      toast.error('لطفا کد تایید را کامل وارد کنید');
      return;
    }

    setLoading(true);

    try {
      console.log('Resetting password with:', { phone, otpCode, codeLength: otpCode.length });
      const result = await resetPassword(phone, otpCode, password);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(result.message);
        router.push('/login');
      }
    } catch (error) {
      console.error('Reset password error:', error);
      toast.error('خطا در ارتباط با سرور');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md px-6">
      <Card className="bg-white/95 backdrop-blur-sm shadow-2xl border-0">
        <CardHeader className="text-center space-y-2">
          <CardTitle className="text-3xl font-bold text-gray-800">
            تعریف رمز
          </CardTitle>
          <CardDescription className="text-base text-gray-600">
            رمز  را وارد کنید
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!showPasswordForm ? (
            <div className="space-y-6">
              <div className="flex justify-center gap-3">
                {code.map((digit, index) => (
                  <input
                    key={index}
                    id={`code-${index}`}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleCodeChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className="w-12 h-14 text-center text-2xl font-bold border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    dir="ltr"
                    disabled={loading}
                  />
                ))}
              </div>

              <Button
                onClick={handleVerify}
                variant="default"
                className="w-full h-11 text-base font-semibold bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white border-0 shadow-lg"
                disabled={loading || code.join('').length !== 6}
              >
                {loading ? 'در حال تایید...' : 'تایید کد'}
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-700 font-medium">
                  رمز عبور جدید
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="رمز عبور جدید را وارد کنید"
                  required
                  minLength={6}
                  dir="rtl"
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-gray-700 font-medium">
                  تکرار رمز عبور
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="رمز عبور را تکرار کنید"
                  required
                  minLength={6}
                  dir="rtl"
                  disabled={loading}
                />
              </div>

              <Button
                onClick={handleResetPassword}
                variant="default"
                className="w-full h-11 text-base font-semibold bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white border-0 shadow-lg"
                disabled={loading}
              >
                {loading ? 'در حال تغییر...' : 'تغییر رمز عبور'}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Toaster position="top-center" />
    </div>
  );
}




