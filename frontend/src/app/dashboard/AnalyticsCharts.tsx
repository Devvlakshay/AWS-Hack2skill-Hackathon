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
  AreaChart,
  Area,
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

  // ── New enhanced data transforms ──────────────────────────────

  // Product popularity ranking (horizontal bar)
  const popularityData = (data.product_visit_stats || []).map((p) => ({
    name: p.name.length > 20 ? p.name.slice(0, 18) + "..." : p.name,
    fullName: p.name,
    score: p.popularity_score,
    views: p.views,
    tryons: p.tryons,
    favorites: p.favorites,
  }));

  // Visit-to-TryOn conversion data
  const conversionData = (data.visit_to_tryon_conversion || []).map((c) => ({
    name: c.name.length > 15 ? c.name.slice(0, 13) + "..." : c.name,
    fullName: c.name,
    conversion_rate: c.conversion_rate,
    views: c.views,
    tryons: c.tryons,
  }));

  // Peak hours data
  const peakHoursData = Object.entries(data.peak_hours || {}).map(
    ([hour, count]) => ({
      hour: `${parseInt(hour)}:00`,
      count,
    })
  );

  // Engagement funnel data
  const engagement = data.user_engagement || {
    unique_users: 0,
    avg_tryons_per_user: 0,
    total_sessions: 0,
  };
  const totalViews = (data.product_visit_stats || []).reduce(
    (sum, p) => sum + p.views,
    0
  );
  const totalTryons = data.total_tryons;
  const totalFavorites = data.total_favorites;
  const funnelData = [
    { stage: "Views", value: totalViews, fill: "#4B7CF3" },
    { stage: "Try-Ons", value: totalTryons, fill: "#B8860B" },
    { stage: "Favorites", value: totalFavorites, fill: "#E05C7A" },
  ];

  const hasLineData = lineData.length > 0;
  const hasCategoryData = categoryData.length > 0;
  const hasAiData = aiData.length > 0;
  const hasPopularityData = popularityData.length > 0;
  const hasConversionData = conversionData.length > 0;
  const hasPeakData = peakHoursData.some((d) => d.count > 0);

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
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "24px",
        marginBottom: "24px",
      }}
    >
      {/* Try-Ons Over Time — min 400px chart height */}
      <div style={cardStyle}>
        <h2 style={cardTitleStyle}>Try-Ons Over Time</h2>
        {!hasLineData ? (
          <div style={emptyStyle}>
            No try-on data available for this period.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={400} minHeight={400}>
            <LineChart
              data={lineData}
              margin={{ top: 8, right: 24, bottom: 8, left: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#E8E8E4"
                vertical={false}
              />
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
                labelStyle={{
                  fontWeight: 600,
                  color: "#1a1a1a",
                  marginBottom: "4px",
                }}
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
                activeDot={{
                  r: 6,
                  fill: "#B8860B",
                  stroke: "#FAF6EE",
                  strokeWidth: 3,
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* ── NEW: Product Popularity Ranking + Conversion Rate ─────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2" style={{ gap: "24px" }}>
        {/* Product Popularity Ranking */}
        <div style={cardStyle}>
          <h2 style={cardTitleStyle}>Product Popularity Ranking</h2>
          {!hasPopularityData ? (
            <div style={{ ...emptyStyle, height: "300px" }}>
              No product visit data yet.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={320}>
              <BarChart
                data={popularityData}
                layout="vertical"
                margin={{ top: 8, right: 24, bottom: 8, left: 8 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#E8E8E4"
                  horizontal={false}
                />
                <XAxis
                  type="number"
                  tick={{ ...AXIS_STYLE, fill: "#888888" }}
                  tickLine={false}
                  axisLine={{ stroke: "#E8E8E4" }}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  tick={{ ...AXIS_STYLE, fill: "#888888", fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  width={130}
                />
                <Tooltip
                  contentStyle={TOOLTIP_STYLE}
                  labelStyle={{ fontWeight: 600, color: "#1a1a1a" }}
                  formatter={(value: number, _name: string, props: { payload: { fullName: string; views: number; tryons: number; favorites: number } }) => {
                    const p = props.payload;
                    return [
                      `${value} pts (${p.views}V / ${p.tryons}T / ${p.favorites}F)`,
                      p.fullName,
                    ];
                  }}
                />
                <Bar dataKey="score" radius={[0, 6, 6, 0]}>
                  {popularityData.map((_, index) => (
                    <Cell
                      key={`pop-${index}`}
                      fill={CHART_COLORS[index % CHART_COLORS.length]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Visit-to-TryOn Conversion */}
        <div style={cardStyle}>
          <h2 style={cardTitleStyle}>Visit-to-TryOn Conversion</h2>
          {!hasConversionData ? (
            <div style={{ ...emptyStyle, height: "300px" }}>
              No conversion data yet.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={320}>
              <BarChart
                data={conversionData}
                margin={{ top: 8, right: 16, bottom: 16, left: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#E8E8E4"
                  vertical={false}
                />
                <XAxis
                  dataKey="name"
                  tick={{ ...AXIS_STYLE, fill: "#888888", fontSize: 10 }}
                  tickLine={false}
                  axisLine={{ stroke: "#E8E8E4" }}
                  interval={0}
                  angle={-20}
                  textAnchor="end"
                  height={60}
                />
                <YAxis
                  tick={{ ...AXIS_STYLE, fill: "#888888" }}
                  tickLine={false}
                  axisLine={false}
                  unit="%"
                />
                <Tooltip
                  contentStyle={TOOLTIP_STYLE}
                  labelStyle={{ fontWeight: 600, color: "#1a1a1a" }}
                  formatter={(value: number, _name: string, props: { payload: { fullName: string; views: number; tryons: number } }) => {
                    const p = props.payload;
                    return [
                      `${value}% (${p.tryons} of ${p.views} views)`,
                      p.fullName,
                    ];
                  }}
                />
                <Bar
                  dataKey="conversion_rate"
                  radius={[6, 6, 0, 0]}
                  fill="#2A9D5C"
                >
                  {conversionData.map((_, index) => (
                    <Cell
                      key={`conv-${index}`}
                      fill={
                        index % 2 === 0 ? "#2A9D5C" : "#4B7CF3"
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* ── NEW: Peak Activity Hours + User Engagement Funnel ────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2" style={{ gap: "24px" }}>
        {/* Peak Activity Hours */}
        <div style={cardStyle}>
          <h2 style={cardTitleStyle}>Peak Activity Hours</h2>
          {!hasPeakData ? (
            <div style={{ ...emptyStyle, height: "280px" }}>
              No hourly data available.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart
                data={peakHoursData}
                margin={{ top: 8, right: 16, bottom: 8, left: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#E8E8E4"
                  vertical={false}
                />
                <XAxis
                  dataKey="hour"
                  tick={{ ...AXIS_STYLE, fill: "#888888", fontSize: 10 }}
                  tickLine={false}
                  axisLine={{ stroke: "#E8E8E4" }}
                  interval={2}
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
                  formatter={(value: number) => [value, "Events"]}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {peakHoursData.map((entry, index) => (
                    <Cell
                      key={`peak-${index}`}
                      fill={
                        entry.count >= 5
                          ? "#B8860B"
                          : entry.count >= 2
                            ? "#E8973A"
                            : "#E8E8E4"
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* User Engagement Funnel */}
        <div style={cardStyle}>
          <h2 style={cardTitleStyle}>Engagement Funnel</h2>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "16px",
              padding: "12px 0",
            }}
          >
            {funnelData.map((item, i) => {
              const maxVal = Math.max(...funnelData.map((d) => d.value), 1);
              const width = Math.max((item.value / maxVal) * 100, 8);
              return (
                <div key={item.stage}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: "6px",
                      fontFamily: "'DM Sans', sans-serif",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "13px",
                        fontWeight: 600,
                        color: "#1a1a1a",
                      }}
                    >
                      {item.stage}
                    </span>
                    <span
                      style={{
                        fontSize: "13px",
                        fontWeight: 700,
                        color: item.fill,
                      }}
                    >
                      {item.value}
                    </span>
                  </div>
                  <div
                    style={{
                      height: "28px",
                      background: "#F5F3EF",
                      borderRadius: "8px",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        height: "100%",
                        width: `${width}%`,
                        background: item.fill,
                        borderRadius: "8px",
                        transition: "width 0.6s ease",
                      }}
                    />
                  </div>
                  {i < funnelData.length - 1 && (
                    <div
                      style={{
                        textAlign: "center",
                        fontSize: "11px",
                        color: "#9A9A9A",
                        marginTop: "4px",
                        fontFamily: "'DM Sans', sans-serif",
                      }}
                    >
                      {funnelData[i + 1].value > 0 && item.value > 0
                        ? `${((funnelData[i + 1].value / item.value) * 100).toFixed(1)}% conversion`
                        : ""}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Engagement summary stats */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr",
                gap: "12px",
                marginTop: "12px",
                padding: "16px",
                background: "#FAF8F4",
                borderRadius: "12px",
              }}
            >
              <div style={{ textAlign: "center" }}>
                <div
                  style={{
                    fontSize: "20px",
                    fontWeight: 700,
                    color: "#B8860B",
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                >
                  {engagement.unique_users}
                </div>
                <div
                  style={{
                    fontSize: "11px",
                    color: "#9A9A9A",
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                >
                  Unique Users
                </div>
              </div>
              <div style={{ textAlign: "center" }}>
                <div
                  style={{
                    fontSize: "20px",
                    fontWeight: 700,
                    color: "#4B7CF3",
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                >
                  {engagement.avg_tryons_per_user}
                </div>
                <div
                  style={{
                    fontSize: "11px",
                    color: "#9A9A9A",
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                >
                  Avg Try-Ons/User
                </div>
              </div>
              <div style={{ textAlign: "center" }}>
                <div
                  style={{
                    fontSize: "20px",
                    fontWeight: 700,
                    color: "#2A9D5C",
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                >
                  {engagement.total_sessions}
                </div>
                <div
                  style={{
                    fontSize: "11px",
                    color: "#9A9A9A",
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                >
                  Total Sessions
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Category Distribution + AI Provider */}
      <div className="grid grid-cols-1 lg:grid-cols-2" style={{ gap: "24px" }}>
        {/* Category Distribution */}
        <div style={cardStyle}>
          <h2 style={cardTitleStyle}>Category Distribution</h2>
          {!hasCategoryData ? (
            <div style={{ ...emptyStyle, height: "240px" }}>
              No category data available.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart
                data={categoryData}
                margin={{ top: 8, right: 16, bottom: 16, left: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#E8E8E4"
                  vertical={false}
                />
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
            <div style={{ ...emptyStyle, height: "240px" }}>
              No AI provider data available.
            </div>
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

      {/* ── NEW: Trending Products + Traffic Sources ─────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2" style={{ gap: "24px" }}>
        {/* Trending Products */}
        <div style={cardStyle}>
          <h2 style={cardTitleStyle}>Trending Products</h2>
          {(!data.trending_products || data.trending_products.length === 0) ? (
            <div style={{ ...emptyStyle, height: "280px" }}>
              No trending data available yet.
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {/* Header row */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 80px 60px",
                  padding: "8px 12px",
                  borderBottom: "1px solid #E8E8E4",
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: "11px",
                  fontWeight: 600,
                  color: "#9A9A9A",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                <span>Product</span>
                <span style={{ textAlign: "right" }}>Score</span>
                <span style={{ textAlign: "center" }}>Trend</span>
              </div>
              {data.trending_products.map((tp, i) => (
                <div
                  key={tp.product_id}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 80px 60px",
                    padding: "10px 12px",
                    borderBottom: i < data.trending_products.length - 1 ? "1px solid #F0EDE6" : "none",
                    fontFamily: "'DM Sans', sans-serif",
                    alignItems: "center",
                  }}
                >
                  <span
                    style={{
                      fontSize: "13px",
                      fontWeight: 500,
                      color: "#1a1a1a",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                    title={tp.name}
                  >
                    {tp.name}
                  </span>
                  <span
                    style={{
                      fontSize: "13px",
                      fontWeight: 700,
                      color: "#B8860B",
                      textAlign: "right",
                    }}
                  >
                    {tp.recent_score}
                  </span>
                  <span
                    style={{
                      textAlign: "center",
                      fontSize: "18px",
                      color: tp.trend === "rising"
                        ? "#2A9D5C"
                        : tp.trend === "declining"
                          ? "#E05C7A"
                          : "#9A9A9A",
                    }}
                    title={tp.trend}
                  >
                    {tp.trend === "rising" ? "\u2191" : tp.trend === "declining" ? "\u2193" : "\u2192"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Traffic Sources */}
        <div style={cardStyle}>
          <h2 style={cardTitleStyle}>Traffic Sources</h2>
          {(!data.traffic_sources || Object.values(data.traffic_sources).every((v) => v === 0)) ? (
            <div style={{ ...emptyStyle, height: "280px" }}>
              No traffic source data available.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={320}>
              <BarChart
                data={Object.entries(data.traffic_sources).map(([name, value]) => ({
                  name: name.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
                  value,
                }))}
                layout="vertical"
                margin={{ top: 8, right: 24, bottom: 8, left: 8 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#E8E8E4"
                  horizontal={false}
                />
                <XAxis
                  type="number"
                  tick={{ ...AXIS_STYLE, fill: "#888888" }}
                  tickLine={false}
                  axisLine={{ stroke: "#E8E8E4" }}
                  allowDecimals={false}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  tick={{ ...AXIS_STYLE, fill: "#888888", fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  width={120}
                />
                <Tooltip
                  contentStyle={TOOLTIP_STYLE}
                  labelStyle={{ fontWeight: 600, color: "#1a1a1a" }}
                  formatter={(value: number) => [value, "Events"]}
                />
                <Bar dataKey="value" radius={[0, 6, 6, 0]}>
                  {Object.keys(data.traffic_sources).map((_, index) => (
                    <Cell
                      key={`traffic-${index}`}
                      fill={CHART_COLORS[index % CHART_COLORS.length]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* ── NEW: Daily Active Users + Cart Analytics ──────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2" style={{ gap: "24px" }}>
        {/* Daily Active Users */}
        <div style={cardStyle}>
          <h2 style={cardTitleStyle}>Daily Active Users</h2>
          {(!data.daily_active_users || data.daily_active_users.length === 0) ? (
            <div style={{ ...emptyStyle, height: "280px" }}>
              No daily user data available.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart
                data={data.daily_active_users.map((d) => ({
                  date: d.date.slice(5),
                  fullDate: d.date,
                  unique_users: d.unique_users,
                }))}
                margin={{ top: 8, right: 24, bottom: 8, left: 0 }}
              >
                <defs>
                  <linearGradient id="dauGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4B7CF3" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#4B7CF3" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#E8E8E4"
                  vertical={false}
                />
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
                  labelFormatter={(_label, payload) => {
                    if (payload && payload.length > 0) {
                      return payload[0]?.payload?.fullDate || _label;
                    }
                    return _label;
                  }}
                  formatter={(value: number) => [value, "Unique Users"]}
                />
                <Area
                  type="monotone"
                  dataKey="unique_users"
                  stroke="#4B7CF3"
                  strokeWidth={2.5}
                  fill="url(#dauGradient)"
                  dot={{ fill: "#4B7CF3", r: 4, strokeWidth: 0 }}
                  activeDot={{
                    r: 6,
                    fill: "#4B7CF3",
                    stroke: "#FFFFFF",
                    strokeWidth: 3,
                  }}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Cart Analytics */}
        <div style={cardStyle}>
          <h2 style={cardTitleStyle}>Cart Analytics</h2>
          {(!data.cart_analytics || data.cart_analytics.length === 0) ? (
            <div style={{ ...emptyStyle, height: "280px" }}>
              No cart data available yet.
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {/* Header row */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 80px 100px",
                  padding: "8px 12px",
                  borderBottom: "1px solid #E8E8E4",
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: "11px",
                  fontWeight: 600,
                  color: "#9A9A9A",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                <span>Product</span>
                <span style={{ textAlign: "right" }}>Cart Adds</span>
                <span style={{ textAlign: "right" }}>Conv. Rate</span>
              </div>
              {data.cart_analytics.map((ca, i) => (
                <div
                  key={ca.product_id}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 80px 100px",
                    padding: "10px 12px",
                    borderBottom: i < data.cart_analytics.length - 1 ? "1px solid #F0EDE6" : "none",
                    fontFamily: "'DM Sans', sans-serif",
                    alignItems: "center",
                  }}
                >
                  <span
                    style={{
                      fontSize: "13px",
                      fontWeight: 500,
                      color: "#1a1a1a",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                    title={ca.name}
                  >
                    {ca.name}
                  </span>
                  <span
                    style={{
                      fontSize: "13px",
                      fontWeight: 700,
                      color: "#9333EA",
                      textAlign: "right",
                    }}
                  >
                    {ca.cart_adds}
                  </span>
                  <span
                    style={{
                      fontSize: "12px",
                      fontWeight: 600,
                      color: "#2A9D5C",
                      textAlign: "right",
                    }}
                  >
                    {ca.cart_conversion_rate}%
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
