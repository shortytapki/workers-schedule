import { useState } from "react";

import type { ScheduleData, Shift } from "../types";
import { getDate, getDurationHours, getHour, HOURS } from "../utils";

type ScheduleRowProps = {
  employee: string;
  date: string;
  planned: Shift[];
  actual: Shift[];
  onRowClick: (shifts: Shift[]) => void;
};

const ScheduleRow: React.FC<ScheduleRowProps> = ({
  employee,
  date,
  planned,
  actual,
  onRowClick,
}) => {
  const renderCell = (hour: number) => {
    const plannedShifts = planned.filter(
      (p) => hour >= getHour(p.start) && hour < getHour(p.end)
    );
    const actualShifts = actual.filter(
      (a) => hour >= getHour(a.start) && hour < getHour(a.end)
    );

    return (
      <td key={hour} className="relative w-10 h-10 border border-gray-300">
        {plannedShifts.map((p) => (
          <div
            key={`plan-${p.id}`}
            className="absolute inset-0 bg-blue-400 opacity-70 hover:opacity-100"
          />
        ))}
        {actualShifts.map((a) => (
          <div
            key={`fact-${a.id}`}
            className="absolute inset-0 bg-[repeating-linear-gradient(45deg,rgba(0,0,0,0.4)_0,rgba(0,0,0,0.4)_2px,transparent_2px,transparent_6px)]"
          />
        ))}
      </td>
    );
  };

  const notes: string[] = [];

  planned.forEach((p) => {
    const f = actual.find(
      (a) =>
        getHour(a.start) < getHour(p.end) && getHour(a.end) > getHour(p.start)
    );
    if (!f) {
      notes.push("Прогул");
    } else {
      if (new Date(f.start) > new Date(p.start)) notes.push("Опоздание");
      if (new Date(f.end) < new Date(p.end)) notes.push("Ранний уход");
      if (
        new Date(f.start) < new Date(p.start) ||
        new Date(f.end) > new Date(p.end)
      )
        notes.push("Сверхурочные");
    }
  });

  return (
    <tr
      className="cursor-pointer hover:bg-gray-100"
      onClick={() => onRowClick(planned)}
    >
      <td className="px-2 py-1 border border-gray-300 font-medium bg-gray-50">
        {employee}
      </td>
      <td className="px-2 py-1 border border-gray-300 bg-gray-50 text-sm text-gray-600">
        {new Date(date).toLocaleDateString()}
      </td>
      {HOURS.map(renderCell)}
      <td className="px-2 py-1 border border-gray-300 text-xs">
        {notes.map((note, idx) => (
          <span
            key={idx}
            className={
              note === "Сверхурочные"
                ? "text-green-600 font-semibold"
                : "text-red-600"
            }
          >
            {note}
            {idx < notes.length - 1 ? ", " : ""}
          </span>
        ))}
      </td>
    </tr>
  );
};

export const Schedule: React.FC<{ data: ScheduleData }> = ({ data }) => {
  const [startDate, setStartDate] = useState("2025-08-31");
  const [endDate, setEndDate] = useState("2025-09-05");

  const handleRowClick = (shifts: Shift[]) => {
    const message = shifts
      .map(
        (s) =>
          `${s.employee} — ${s.role} (${
            s.store
          })\nПлановая длительность: ${getDurationHours(s.start, s.end)} ч`
      )
      .join("\n\n");
    alert(message);
  };

  const start = new Date(startDate);
  const end = new Date(endDate);

  const filteredPlan = data.plan.filter((s) => {
    const d = new Date(s.start);
    return d >= start && d <= end;
  });
  const filteredFact = data.fact.filter((s) => {
    const d = new Date(s.start);
    return d >= start && d <= end;
  });

  const grouped: Record<
    string,
    { employee: string; date: string; planned: Shift[]; actual: Shift[] }
  > = {};

  filteredPlan.forEach((p) => {
    const date = getDate(p.start);
    const key = `${p.employee}_${date}`;
    if (!grouped[key])
      grouped[key] = { employee: p.employee, date, planned: [], actual: [] };
    grouped[key].planned.push(p);
  });

  filteredFact.forEach((f) => {
    const date = getDate(f.start);
    const key = `${f.employee}_${date}`;
    if (!grouped[key])
      grouped[key] = { employee: f.employee, date, planned: [], actual: [] };
    grouped[key].actual.push(f);
  });

  return (
    <div>
      <div className="flex gap-4 mb-4">
        <div>
          <label className="block text-sm">Дата начала</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="border rounded px-2 py-1"
          />
        </div>
        <div>
          <label className="block text-sm">Дата окончания</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="border rounded px-2 py-1"
          />
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="border-collapse border border-gray-400 text-sm min-w-[900px]">
          <thead>
            <tr>
              <th className="px-2 py-1 border border-gray-300 bg-gray-100">
                Сотрудник
              </th>
              <th className="px-2 py-1 border border-gray-300 bg-gray-100">
                Дата
              </th>
              {HOURS.map((h) => (
                <th
                  key={h}
                  className="w-10 border border-gray-300 bg-gray-100 text-center"
                >
                  {h}
                </th>
              ))}
              <th className="px-2 py-1 border border-gray-300 bg-gray-100">
                Примечание
              </th>
            </tr>
          </thead>
          <tbody>
            {Object.values(grouped).map((row, i) => (
              <ScheduleRow key={i} {...row} onRowClick={handleRowClick} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
