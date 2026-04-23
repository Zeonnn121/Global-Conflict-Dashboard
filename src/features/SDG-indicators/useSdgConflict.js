import { useState, useEffect, useCallback } from 'react';

const SDG_DATA = {
  1: {
    sdg: 1,
    label: 'No Poverty',
    description: 'Conflict-driven poverty reversal in fragile states.',
    metrics: [
      { label: 'Countries in crisis', value: '43', delta: '+12 since 2020', negative: true },
      { label: 'Extreme poverty rate', value: '8.4%', delta: '+2.1pp', negative: true },
      { label: 'People pushed into poverty', value: '95M', delta: 'From active conflicts', negative: true },
      { label: 'Aid funding gap', value: '$38B', delta: 'Rising YoY', negative: true },
    ],
    compare: [
      { label: 'Poverty headcount', before: 18, after: 34, unit: '%' },
      { label: 'Social protection coverage', before: 54, after: 29, unit: '%' },
      { label: 'GDP per capita (indexed)', before: 100, after: 61, unit: 'idx' },
    ],
    countries: [
      { name: 'Sudan', score: 91, tier: 'Critical' },
      { name: 'Yemen', score: 88, tier: 'Critical' },
      { name: 'Haiti', score: 79, tier: 'Critical' },
      { name: 'DR Congo', score: 74, tier: 'Severe' },
    ],
    trend: [
      { year: '2020', value: 18 },
      { year: '2021', value: 22 },
      { year: '2022', value: 26 },
      { year: '2023', value: 30 },
      { year: '2024', value: 34 },
    ],
    trendLabel: 'Poverty headcount in conflict zones (%)',
    timeline: [
      { year: '2020', text: 'Global crises accelerated poverty growth.', severity: 'critical' },
      { year: '2022', text: 'Supply-chain disruptions worsened living costs.', severity: 'severe' },
      { year: '2024', text: 'Multiple conflict fronts increased displacement.', severity: 'critical' },
    ],
    meta: { sources: ['UN SDG Database', 'World Bank'] },
  },
  2: {
    sdg: 2,
    label: 'Zero Hunger',
    description: 'Food insecurity and malnutrition under conflict pressure.',
    metrics: [
      { label: 'Acutely food insecure', value: '282M', delta: '+21M YoY', negative: true },
      { label: 'Conflict-caused hunger', value: '60%', delta: 'Of acute cases', negative: true },
      { label: 'Child malnutrition', value: '38%', delta: 'Above global avg', negative: true },
      { label: 'Agricultural land lost', value: '31%', delta: 'Conflict areas', negative: true },
    ],
    compare: [
      { label: 'Food security index', before: 62, after: 31, unit: 'idx' },
      { label: 'Crop production (indexed)', before: 100, after: 52, unit: 'idx' },
      { label: 'Child malnutrition', before: 14, after: 38, unit: '%' },
    ],
    countries: [
      { name: 'Yemen', score: 94, tier: 'Critical' },
      { name: 'Somalia', score: 91, tier: 'Critical' },
      { name: 'Sudan', score: 87, tier: 'Critical' },
      { name: 'South Sudan', score: 82, tier: 'Critical' },
    ],
    trend: [
      { year: '2020', value: 14 },
      { year: '2021', value: 18 },
      { year: '2022', value: 23 },
      { year: '2023', value: 29 },
      { year: '2024', value: 38 },
    ],
    trendLabel: 'Child malnutrition in conflict zones (%)',
    timeline: [
      { year: '2021', text: 'Regional famines intensified.', severity: 'critical' },
      { year: '2023', text: 'Acute insecurity reached record levels.', severity: 'critical' },
      { year: '2024', text: 'Access constraints reduced aid effectiveness.', severity: 'severe' },
    ],
    meta: { sources: ['WFP', 'FAOSTAT', 'UNICEF'] },
  },
  16: {
    sdg: 16,
    label: 'Peace & Justice',
    description: 'Institutional erosion and civilian protection breakdown.',
    metrics: [
      { label: 'Active armed conflicts', value: '59', delta: '30-year high', negative: true },
      { label: 'People displaced', value: '117M', delta: 'Global estimate', negative: true },
      { label: 'Conflict deaths', value: '233k', delta: '+18% vs 2023', negative: true },
      { label: 'Rule of law decline', value: '-14%', delta: '5-year avg', negative: true },
    ],
    compare: [
      { label: 'Institutional trust', before: 58, after: 22, unit: '%' },
      { label: 'Rule of law (indexed)', before: 100, after: 38, unit: 'idx' },
      { label: 'Civilian safety (indexed)', before: 100, after: 29, unit: 'idx' },
    ],
    countries: [
      { name: 'Myanmar', score: 96, tier: 'Critical' },
      { name: 'Sudan', score: 93, tier: 'Critical' },
      { name: 'Syria', score: 84, tier: 'Critical' },
      { name: 'Somalia', score: 76, tier: 'Severe' },
    ],
    trend: [
      { year: '2020', value: 72 },
      { year: '2021', value: 68 },
      { year: '2022', value: 61 },
      { year: '2023', value: 55 },
      { year: '2024', value: 47 },
    ],
    trendLabel: 'Rule of law index in conflict states (avg)',
    timeline: [
      { year: '2021', text: 'Institutional collapses increased displacement.', severity: 'critical' },
      { year: '2022', text: 'Cross-border conflict raised civilian risk.', severity: 'critical' },
      { year: '2024', text: 'Conflict counts reached historic peaks.', severity: 'critical' },
    ],
    meta: { sources: ['ACLED', 'UNHCR', 'WJP'] },
  },
};

export function useSdgConflict(options = {}) {
  const { sdg } = options;
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tick, setTick] = useState(0);

  const refetch = useCallback(() => setTick((t) => t + 1), []);

  useEffect(() => {
    setLoading(true);
    setError(null);

    const timer = setTimeout(() => {
      if (sdg && !SDG_DATA[sdg]) {
        setError('No SDG data found for selection.');
        setData(null);
      } else {
        setData(sdg ? SDG_DATA[sdg] : Object.values(SDG_DATA));
      }
      setLoading(false);
    }, 120);

    return () => clearTimeout(timer);
  }, [sdg, tick]);

  return { data, loading, error, refetch };
}