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
