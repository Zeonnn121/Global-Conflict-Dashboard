import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
} from 'recharts';
import data from '../../data.json';

const COUNTRY_COMPARISON_LIMIT = 20;
const TOP_COUNTRIES_LIMIT = 20;

// Process data for trend line chart (by year)
const getTrendData = () => {
  const yearMap = {};
  data.forEach((item) => {
    if (!yearMap[item.Year]) {
      yearMap[item.Year] = 0;
    }
    yearMap[item.Year] += item.Events;
  });
  return Object.keys(yearMap)
    .map((year) => ({
      year: parseInt(year, 10),
      events: yearMap[year],
    }))
    .sort((a, b) => a.year - b.year);
};

// Process data for country comparison (latest year)
const getCountryComparison = () => {
  const year = 2019;

  const filtered = data
    .filter((item) => item.Year === year)
    .sort((a, b) => b.Events - a.Events)
    .slice(0, COUNTRY_COMPARISON_LIMIT);

  return { filtered, year };
};

// Get top countries by total events
const getTopCountries = () => {
  const countryTotals = {};
  data.forEach((item) => {
    if (!countryTotals[item.Country]) {
      countryTotals[item.Country] = 0;
    }
    countryTotals[item.Country] += item.Events;
  });
  return Object.keys(countryTotals)
    .map((country) => ({
      country,
      total: countryTotals[country],
    }))
    .sort((a, b) => b.total - a.total)
    .slice(0, TOP_COUNTRIES_LIMIT);
};

const COLORS = ['#111827', '#374151', '#4b5563', '#6b7280', '#9ca3af', '#1f2937'];

export function TrendChart() {
  const trendData = getTrendData();
  return (
    <div className="chart-container">
      <h2>Trend</h2>
      <p className="subtitle">Total political violence events over years</p>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={trendData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="year" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line
            type="monotone"
            dataKey="events"
            stroke="#111827"
            strokeWidth={2}
            dot={{ fill: '#111827', r: 4 }}
            activeDot={{ r: 7 }}
            name="Total Events"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function CountryComparison() {
  const {filtered,year} = getCountryComparison();
  return (
    <div className="chart-container">
      <h2>Country comparison</h2>
      <p className="subtitle">Top {COUNTRY_COMPARISON_LIMIT} countries (In the year {year})</p>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={filtered}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="Country" angle={-45} textAnchor="end" height={90} interval={0} />
          <YAxis />
          <Tooltip />
          <Bar dataKey="Events" radius={[8, 8, 0, 0]}>
            {filtered.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function TopCountries() {
  const topCountries = getTopCountries();
  return (
    <div className="chart-container">
      <h2>Top countries</h2>
      <p className="subtitle">Top {TOP_COUNTRIES_LIMIT} countries by total events</p>
      <div className="ranking-list">
        {topCountries.map((item, index) => (
          <div key={item.country} className="ranking-item">
            <div className="rank-badge">{index + 1}</div>
            <div className="rank-content">
              <div className="country-name">{item.country}</div>
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{
                    width: `${(item.total / topCountries[0].total) * 100}%`,
                    backgroundColor: COLORS[index % COLORS.length],
                  }}
                ></div>
              </div>
            </div>
            <div className="rank-value">{item.total.toLocaleString()}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
