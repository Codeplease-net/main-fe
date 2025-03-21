import { TestCase } from './types';

export function getTimeInHoursAndMinutesWithGMT(timestamp: number): string {
  const date = new Date(timestamp * 1000);
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  const gmtOffset = -date.getTimezoneOffset() / 60;
  const gmtSign = gmtOffset >= 0 ? "+" : "-";
  const gmt = `GMT${gmtSign}${Math.abs(gmtOffset)}`;
  return `${hours}:${minutes} ${gmt}`;
}

export function getDate(timestamp: number): string {
  const date = new Date(timestamp * 1000);
  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

export function getLocalTimeAndDate(timestamp: number): string {
  const date = new Date(timestamp * 1000);
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  const seconds = date.getSeconds().toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const year = date.getFullYear();
  return `${hours}:${minutes}:${seconds} ${day}/${month}/${year}`;
}

export function countAccepted(tests: TestCase[]): number {
  if (!tests) return 0;
  return tests.reduce(
    (acc, test) => (test.result === "AC" ? acc + 1 : acc),
    0
  );
}

export function calculateTime(tests: TestCase[]): string {
  if (!tests) return "";
  const maxTime = Math.max(...tests.map((test) => test.time_used));
  return `${maxTime} ms`;
}

export function calculateMemory(tests: TestCase[]): string {
  if (!tests) return "";
  const maxMemory = Math.max(...tests.map((test) => test.memory_used));
  return `${maxMemory / 1024} KB`;
}