import Decimal from 'decimal.js';

export const roundToTwoDecimals = (value: number): number => {
  return new Decimal(value).toDP(2).toNumber();
};

export const splitEqualAmount = (totalAmount: number, participants: number): number => {
  const amount = new Decimal(totalAmount).dividedBy(new Decimal(participants));
  return amount.toDP(2).toNumber();
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validateCurrency = (amount: number): boolean => {
  return !isNaN(amount) && amount > 0 && amount <= 1000000;
};
