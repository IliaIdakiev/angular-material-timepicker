export type ClockViewType = 'hours' | 'minutes';
export type ClockMode = '12h' | '24h';

export interface ClockNumber {
  display: number;
  translateX: number;
  translateY: number;
  allowed: boolean;
}

export interface ITimeData {
  minutes: number;
  hours: number;
  meridiem: string;
}

export interface IAllowed24HourMap { [hour: number]: { [minute: number]: boolean; }; }
export interface IAllowed12HourMap {
  am: { [hour: number]: { [minute: number]: boolean } };
  pm: { [hour: number]: { [minute: number]: boolean } };
}
