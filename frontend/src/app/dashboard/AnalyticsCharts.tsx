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

// ─── Design-token aligned palette — no violet ────────────────
const CHART_COLORS = [
  "#B8860B", // gold
  "#1a1a1a", // ink
  "#4B7CF3", // blue accent
  "#E05C7A", // rose
  "#2A9D5C", // green
  "#E8973A", // amber
];

const TOOLTIP_STYLE = {
  backgroundColor: "#FFFFFF",
  border: "1px solid #E8E8E4",
  borderRadius: "10px",
  color: "#1a1a1a",
  fontSize: "13px",
  fontFamily: "'DM Sans', sans-serif",
  boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
};

const AXIS_STYLE = {
  stroke: "#888888",
  fontSize: 12,
  fontFamily: "'DM Sans', sans-serif",
};

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

  // Shared card wrapper style
  const cardStyle: React.CSSProperties = {
    background: "#FFFFFF",
    border: "1px solid #E8E8E4",
    borderRadius: "16px",
    padding: "24px",
  };

  const cardTitleStyle: React.CSSProperties = {
    fontFamily: "'Playfair Display', serif",
    fontSize: "16px",
    fontWeight: 600,
    color: "#1a1a1a",
    marginBottom: "20px",
  };

  const emptyStyle: React.CSSProperties = {
    height: "280px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#888888",
    fontSize: "13px",
    fontFamily: "'DM Sans', sans-serif",
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px", marginBottom: "24px" }}>
      {/* Try-Ons Over Time — min 400px chart height */}
      <div style={cardStyle}>
        <h2 style={cardTitleStyle}>Try-Ons Over Time</h2>
        {!hasLineData ? (
          <div style={emptyStyle}>No try-on data available for this period.</div>
        ) : (
          <ResponsiveContainer width="100%" height={400} minHeight={400}>
            <LineChart data={lineData} margin={{ top: 8, right: 24, bottom: 8, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E8E8E4" vertical={false} />
              <XAxis
                dataKey="date"
                tick={{ ...AXIS_STYLE, fill: "#888888" }}
                tickLine={false}
                axisLine={{ stroke: "#E8E8E4" }}
              />
              <YAxis
                tick={{ ...AXIS_STYLE, fill: "#888888" }}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={TOOLTIP_STYLE}
                labelStyle={{ fontWeight: 600, color: "#1a1a1a", marginBottom: "4px" }}
                labelFormatter={(label, payload) => {
                  if (payload && payload.length > 0) {
                    return payload[0]?.payload?.fullDate || label;
                  }
                  return label;
                }}
                formatter={(value: number) => [value, "Try-Ons"]}
              />
              <Line
                type="monotone"
                dataKey="count"
                stroke="#B8860B"
                strokeWidth={2.5}
                dot={{ fill: "#B8860B", r: 4, strokeWidth: 0 }}
                activeDot={{ r: 6, fill: "#B8860B", stroke: "#FAF6EE", strokeWidth: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Category Distribution + AI Provider */}
      <div
        className="grid grid-cols-1 lg:grid-cols-2"
        style={{ gap: "24px" }}
      >
        {/* Category Distribution */}
        <div style={cardStyle}>
          <h2 style={cardTitleStyle}>Category Distribution</h2>
          {!hasCategoryData ? (
            <div style={{ ...emptyStyle, height: "240px" }}>No category data available.</div>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={categoryData} margin={{ top: 8, right: 16, bottom: 16, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E8E8E4" vertical={false} />
                <XAxis
                  dataKey="name"
                  tick={{ ...AXIS_STYLE, fill: "#888888", fontSize: 11 }}
                  tickLine={false}
                  axisLine={{ stroke: "#E8E8E4" }}
                  interval={0}
                  angle={-15}
                  textAnchor="end"
                  height={50}
                />
                <YAxis
                  tick={{ ...AXIS_STYLE, fill: "#888888" }}
                  tickLine={false}
                  axisLine={false}
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={TOOLTIP_STYLE}
                  labelStyle={{ fontWeight: 600, color: "#1a1a1a" }}
                  formatter={(value: number) => [value, "Try-Ons"]}
                />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {categoryData.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={CHART_COLORS[index % CHART_COLORS.length]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* AI Provider Distribution */}
        <div style={cardStyle}>
          <h2 style={cardTitleStyle}>AI Provider Usage</h2>
          {!hasAiData ? (
            <div style={{ ...emptyStyle, height: "240px" }}>No AI provider data available.</div>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={aiData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={4}
                  dataKey="value"
                  label={({ name, percent }) =>
                    `${name} (${(percent * 100).toFixed(0)}%)`
                  }
                  labelLine={{ stroke: "#E8E8E4", strokeWidth: 1 }}
                >
                  {aiData.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={CHART_COLORS[index % CHART_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={TOOLTIP_STYLE}
                  labelStyle={{ fontWeight: 600, color: "#1a1a1a" }}
                  formatter={(value: number) => [value, "Try-Ons"]}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}
