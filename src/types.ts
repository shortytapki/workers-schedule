export interface Shift {
  id: number;
  employee: string;
  store: string;
  role: string;
  start: string;
  end: string;
}

export type ScheduleData = {
  plan: Shift[];
  fact: Shift[];
};
