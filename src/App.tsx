import { useEffect, useState } from "react";
import { Schedule } from "./components/Schedule";
import type { ScheduleData } from "./types";

export default function App() {
  const [data, setData] = useState<ScheduleData>({ plan: [], fact: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/data.json")
      .then((res) => res.json())
      .then((json) => {
        setData(json);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Ошибка загрузки JSON:", err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <p className="p-4">Загрузка...</p>;
  }

  if (!data) {
    return <p className="p-4 text-red-600">Не удалось загрузить данные.</p>;
  }

  return (
    <main className="p-4">
      <Schedule data={data} />
    </main>
  );
}
