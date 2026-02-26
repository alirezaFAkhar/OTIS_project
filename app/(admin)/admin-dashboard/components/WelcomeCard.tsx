'use client';

export default function WelcomeCard() {
  return (
    <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
      <h1 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2 sm:mb-4">
        خوش آمدید به پنل مدیریت
      </h1>
      <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
        این پنل مدیریتی برای مدیریت سیستم است. از منوی سمت راست می‌توانید به بخش‌های مختلف
        دسترسی داشته باشید.
      </p>
    </div>
  );
}




