"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const PALETTE = ["#118a43", "#f4c10f", "#0d6b34", "#3b82f6", "#f97316", "#8b5cf6", "#ef4444", "#14a04f", "#94a3b8"];

const tooltipStyle = {
  borderRadius: 12,
  border: "1px solid #e2e8f0",
  fontSize: 13,
  boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
};

export function PlayersPerTeamChart({ data }: { data: { team: string; count: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={Math.max(220, data.length * 34)}>
      <BarChart data={data} layout="vertical" margin={{ left: 8, right: 16, top: 4, bottom: 4 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
        <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12, fill: "#64748b" }} />
        <YAxis type="category" dataKey="team" width={140} tick={{ fontSize: 12, fill: "#334155" }} />
        <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "#f8fafc" }} />
        <Bar dataKey="count" name="Joueurs" fill="#118a43" radius={[0, 6, 6, 0]} barSize={16} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function DonutChart({ data: rawData }: { data: { name: string; value: number }[] }) {
  // Recharts (3.x) ne dessine aucun secteur quand une part vaut 0, ou quand une
  // seule part couvre 100% (bug connu recharts#4385). On filtre les parts à 0 et,
  // s'il n'en reste qu'une, on ajoute une part fantôme invisible pour forcer deux arcs.
  const data = rawData.filter((entry) => entry.value > 0);
  const needsFiller = data.length === 1;
  const chartData = needsFiller ? [...data, { name: "__filler__", value: data[0].value * 0.0001 }] : data;

  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie
          data={chartData}
          dataKey="value"
          nameKey="name"
          innerRadius={55}
          outerRadius={90}
          paddingAngle={2}
          isAnimationActive={false}
        >
          {chartData.map((entry, index) => (
            <Cell
              key={entry.name || `filler-${index}`}
              fill={entry.name === "__filler__" ? "transparent" : PALETTE[index % PALETTE.length]}
            />
          ))}
        </Pie>
        <Legend
          verticalAlign="bottom"
          height={36}
          wrapperStyle={{ fontSize: 12 }}
          content={() => (
            <ul className="mt-2 flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs">
              {data.map((entry, index) => (
                <li key={entry.name} className="flex items-center gap-1.5">
                  <span
                    className="h-2.5 w-2.5 rounded-sm"
                    style={{ backgroundColor: PALETTE[index % PALETTE.length] }}
                  />
                  {entry.name}
                </li>
              ))}
            </ul>
          )}
        />
        <Tooltip contentStyle={tooltipStyle} />
      </PieChart>
    </ResponsiveContainer>
  );
}

export function AgeDistributionChart({ data }: { data: { bucket: string; count: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data} margin={{ top: 4, right: 8, left: -12, bottom: 4 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
        <XAxis dataKey="bucket" tick={{ fontSize: 12, fill: "#64748b" }} />
        <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: "#64748b" }} />
        <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "#f8fafc" }} />
        <Bar dataKey="count" name="Joueurs" fill="#f4c10f" radius={[6, 6, 0, 0]} barSize={36} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function NationalityBarChart({ data }: { data: { name: string; count: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={Math.max(220, data.length * 32)}>
      <BarChart data={data} layout="vertical" margin={{ left: 8, right: 16, top: 4, bottom: 4 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
        <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12, fill: "#64748b" }} />
        <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 12, fill: "#334155" }} />
        <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "#f8fafc" }} />
        <Bar dataKey="count" name="Joueurs" fill="#3b82f6" radius={[0, 6, 6, 0]} barSize={16} />
      </BarChart>
    </ResponsiveContainer>
  );
}
