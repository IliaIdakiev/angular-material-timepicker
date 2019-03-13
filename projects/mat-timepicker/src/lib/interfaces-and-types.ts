export type ClockType = '12h' | '24h' | 'minutes';

export interface ClockNumber {
  display: number;
  translateX: number;
  translateY: number;
}

export interface ITimeData {
  minutes: number;
  hours: number;
  meridiem: string;
}
