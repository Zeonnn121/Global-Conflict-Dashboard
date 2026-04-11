import React from 'react';
import './ViolenceAnalytics.css';
import { WorldMap } from './WorldMap';
import { TrendChart, CountryComparison, TopCountries } from './Charts';

export default function ViolenceAnalytics() {
  return (
    <div className="va">
      <div className="vaHeader">
        <h1>Violence analytics</h1>
        <p>Explore incidents by country and year.</p>
      </div>

      <div className="dashboard-container">
        <WorldMap />
        <TrendChart />
        <CountryComparison />
        <TopCountries />
      </div>
    </div>
  );
}
