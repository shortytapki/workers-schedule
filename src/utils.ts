export const HOURS = Array.from({ length: 24 }, (_, i) => i);

export const getHour = (dateStr: string) => new Date(dateStr).getHours();
export const getDate = (dateStr: string) => dateStr.split("T")[0];

export const getDurationHours = (start: string, end: string) => {
  const diffMs = new Date(end).getTime() - new Date(start).getTime();
  return diffMs / (1000 * 60 * 60);
};
