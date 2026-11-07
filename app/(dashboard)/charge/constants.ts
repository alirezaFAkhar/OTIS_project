import { Package, Bank } from './types';

// TODO: این داده‌ها باید از دیتابیس بیایند
export const PACKAGES: Package[] = [
  { id: '1', amount: '100000', label: '۱۰۰,۰۰۰ ریال' },
  { id: '2', amount: '200000', label: '۲۰۰,۰۰۰ ریال' },
  { id: '3', amount: '500000', label: '۵۰۰,۰۰۰ ریال' },
  { id: '4', amount: '1000000', label: '۱,۰۰۰,۰۰۰ ریال' },
];

export const BANKS: Bank[] = [
  {
    id: 'melat',
    name: 'بانک ملت',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Bank_Mellat_logo.svg/512px-Bank_Mellat_logo.svg.png',
    color: '#00A651',
  },
  {
    id: 'melli',
    name: 'بانک ملی',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Bank_Melli_Iran_logo.svg/512px-Bank_Melli_Iran_logo.svg.png',
    color: '#0066CC',
  },
  {
    id: 'pasargad',
    name: 'بانک پاسارگاد',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/Bank_Pasargad_logo.svg/512px-Bank_Pasargad_logo.svg.png',
    color: '#FF6B00',
  },
];

















