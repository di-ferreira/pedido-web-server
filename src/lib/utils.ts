import { compareSync, genSaltSync, hashSync } from 'bcryptjs';
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const returnExpiresTimes = (minutes: number) => {
  const now = new Date();
  const seconds = minutes * 60;
  const milliseconds = seconds * 1000;

  return now.setTime(now.getTime() + milliseconds);
};

export function generateHash(password: string): string {
  const salt = genSaltSync(10);

  const hashedPassword = hashSync(password, salt);

  return hashedPassword;
}

export function compareHash(password: string, hash: string): boolean {
  return compareSync(password, hash);
}

export const MaskCnpjCpf = (value: string | undefined) => {
  if (!value) return '';
  if (value.length <= 12)
    return value
      .replace(/\D/g, '')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})/, '$1-$2')
      .replace(/(-\d{2})\d+?$/, '$1');

  if (value.length > 12)
    return value
      .replace(/[\D]/g, '')
      .replace(/(\d{2})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1/$2')
      .replace(/(\d{4})(\d)/, '$1-$2')
      .replace(/(-\d{2})\d+?$/, '$1');
};

export const FormatToCurrency = (value: string): string => {
  const BrlValue = Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 3,
  });
  const result = BrlValue.format(parseFloat(value));
  return result;
};

export const FormatToNumber = (value: string): number => {
  const BrlValue = Intl.NumberFormat('pt-BR', {
    // style: 'currency',
    // currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 3,
  });
  const result = BrlValue.format(parseFloat(value));
  return parseFloat(result);
};

export function saveStorage<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value));
}

export function loadStorage<T>(key: string): T {
  const result: T = JSON.parse(String(localStorage.getItem(key)));
  return result;
}

export function removeStorage(key: string): void {
  localStorage.removeItem(key);
}

