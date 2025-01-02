import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function calculateYearOffset(year: number) {
  // Validate input
  if (year < 1) {
    throw new Error("Year must be greater than 0");
  }
  return new Date(year, 0, 1).getDay() - 1 
}
