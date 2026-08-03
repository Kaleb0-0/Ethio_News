// @ts-ignore
import { toEthiopian } from "ethiopian-date";

const ethiopianMonths = ["መስከረም", "ጥቅምት", "ህዳር", "ታህሳስ", "ጥር", "የካቲት", "መጋቢት", "ሚያዚያ", "ግንቦት", "ሰኔ", "ሐምሌ", "ነሐሴ", "ጳጉሜ"];

const ethiopianDays = ["እሑድ", "ሰኞ", "ማክሰኞ", "ረቡዕ", "ሐሙስ", "አርብ", "ቅዳሜ"];

export const toEthiopianDate = (date: Date): string => {
  const [ethYear, ethMonth, ethDay] = toEthiopian(date.getFullYear(), date.getMonth() + 1, date.getDate());

  const dayName = ethiopianDays[date.getDay()];
  const monthName = ethiopianMonths[ethMonth - 1];

  return `${dayName} ${monthName} ${ethDay}, ${ethYear}`;
};

export const toEthiopianTime = (date: Date): string => {
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
};
