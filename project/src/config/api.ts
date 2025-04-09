export const API_KEY = 'rBumMflWKw9ZbzBXHSPldVJxI00K9Ztq';
export const BASE_URL = 'https://calendarific.com/api/v2';

export interface Holiday {
  name: string;
  description: string;
  date: {
    iso: string;
  };
  type: string[];
}

export interface HolidaysResponse {
  meta: {
    code: number;
  };
  response: {
    holidays: Holiday[];
  };
} 