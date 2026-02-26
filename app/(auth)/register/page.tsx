'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { register } from '@/lib/api';
import toast, { Toaster } from 'react-hot-toast';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function RegisterPage() {
  const [username, setUsername] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await register(username, phone);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(result.message);
        router.push(`/verify-otp?phone=${phone}&type=register`);
      }
    } catch (error) {
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
            ثبت نام
          </CardTitle>
          <CardDescription className="text-base text-gray-600">
            اطلاعات خود را وارد کنید
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-gray-700 font-medium">
                نام کاربری
              </Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="نام کاربری خود را وارد کنید"
                required
                minLength={3}
                dir="rtl"
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="text-gray-700 font-medium">
                شماره تلفن
              </Label>
              <Input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="09123456789"
                required
                pattern="09\d{9}"
                dir="ltr"
                disabled={loading}
              />
            </div>

            <Button
              type="submit"
              variant="default"
              className="w-full h-11 text-base font-semibold bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white border-0 shadow-lg"
              disabled={loading}
            >
              {loading ? 'در حال ثبت نام...' : 'ثبت نام و ارسال کد تایید'}
            </Button>
          </form>

          <div className="mt-6 text-center space-y-2">
            <Link 
              href="/login" 
              className="text-sm font-medium text-primary hover:text-primary/80 block transition-colors"
            >
              قبلا ثبت نام کرده‌اید؟ وارد شوید
            </Link>
          </div>
        </CardContent>
      </Card>

      <Toaster position="top-center" />
    </div>
  );
}







