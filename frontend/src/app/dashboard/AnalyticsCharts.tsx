"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import type { DashboardData } from "@/lib/api/analytics";

const COLORS = ["#8b5cf6", "#a78bfa", "#c4b5fd", "#f59e0b", "#fbbf24", "#fde68a"];

interface Props {
  data: DashboardData;
}

export default function AnalyticsCharts({ data }: Props) {
  // Transform tryons_by_date for LineChart
  const lineData = Object.entries(data.tryons_by_date).map(([date, count]) => ({
    date: date.slice(5), // MM-DD for readability
    fullDate: date,
    count,
  }));

  // Category distribution for BarChart
  const categoryData = Object.entries(data.category_distribution).map(
    ([name, value]) => ({ name, value })
  );

  // AI provider distribution for PieChart
  const aiData = Object.entries(data.ai_provider_distribution).map(
    ([name, value]) => ({ name, value })
  );

  const hasLineData = lineData.length > 0;
  const hasCategoryData = categoryData.length > 0;
  const hasAiData = aiData.length > 0;

  return (
    <div className="space-y-6 mb-6">
      {/* Try-Ons Over Time */}
      <div className="glass-card p-6">
        <h2 className="text-lg font-semibold text-[rgb(var(--text-primary))] mb-4">
          Try-Ons Over Time
        </h2>
        {!hasLineData ? (
          <div className="h-64 flex items-center justify-center text-[rgb(var(--text-muted))] text-sm">
            No try-on data available for this period.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={lineData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(var(--glass-border))" />
              <XAxis
                dataKey="date"
                stroke="rgb(var(--text-muted))"
                fontSize={12}
                tickLine={false}
              />
              <YAxis
                stroke="rgb(var(--text-muted))"
                fontSize={12}
                tickLine={false}
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(15, 15, 25, 0.85)",
                  border: "1px solid rgba(var(--glass-border))",
                  borderRadius: "12px",
                  color: "rgb(var(--text-primary))",
                  backdropFilter: "blur(12px)",
                }}
                labelFormatter={(label, payload) => {
                  if (payload && payload.length > 0) {
                    return payload[0]?.payload?.fullDate || label;
                  }
                  return label;
                }}
              />
              <Line
                type="monotone"
                dataKey="count"
                stroke="#8b5cf6"
                strokeWidth={2}
                dot={{ fill: "#8b5cf6", r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Category Distribution + AI Provider */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Distribution */}
        <div className="glass-card p-6">
          <h2 className="text-lg font-semibold text-[rgb(var(--text-primary))] mb-4">
            Category Distribution
          </h2>
          {!hasCategoryData ? (
            <div className="h-56 flex items-center justify-center text-[rgb(var(--text-muted))] text-sm">
              No category data available.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={categoryData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(var(--glass-border))" />
                <XAxis
                  dataKey="name"
                  stroke="rgb(var(--text-muted))"
                  fontSize={11}
                  tickLine={false}
                  interval={0}
                  angle={-20}
                  textAnchor="end"
                  height={50}
                />
                <YAxis
                  stroke="rgb(var(--text-muted))"
                  fontSize={12}
                  tickLine={false}
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(15, 15, 25, 0.85)",
                    border: "1px solid rgba(var(--glass-border))",
                    borderRadius: "12px",
                    color: "rgb(var(--text-primary))",
                    backdropFilter: "blur(12px)",
                  }}
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {categoryData.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* AI Provider Distribution */}
        <div className="glass-card p-6">
          <h2 className="text-lg font-semibold text-[rgb(var(--text-primary))] mb-4">
            AI Provider Usage
          </h2>
          {!hasAiData ? (
            <div className="h-56 flex items-center justify-center text-[rgb(var(--text-muted))] text-sm">
              No AI provider data available.
            </div>
          ) : (
            <div className="flex items-center justify-center">
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie
                    data={aiData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={90}
                    paddingAngle={4}
                    dataKey="value"
                    label={({ name, percent }) =>
                      `${name} (${(percent * 100).toFixed(0)}%)`
                    }
                  >
                    {aiData.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(15, 15, 25, 0.85)",
                      border: "1px solid rgba(var(--glass-border))",
                      borderRadius: "12px",
                      color: "rgb(var(--text-primary))",
                      backdropFilter: "blur(12px)",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
