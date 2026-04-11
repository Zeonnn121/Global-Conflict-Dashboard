import { useState } from 'react';
import { useSdgConflict } from './useSdgConflict';
import './SdgConflictDashboard.css';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

// ─── Sub-components ────────────────────────────────────────────────────────────

const TIER_STYLES = {
  Critical: 'sdgTierCritical',
  Severe: 'sdgTierSevere',
  Moderate: 'sdgTierModerate',
};

function MetricCards({ metrics }) {
  return (
    <div className="sdgMetricsGrid">
      {metrics.map((m) => (
        <div key={m.label} className="sdgMetricCard">
          <p className="sdgMetricLabel">{m.label}</p>
          <p className="sdgMetricValue">{m.value}</p>
          <p className={`sdgMetricDelta ${m.negative ? 'sdgBad' : 'sdgGood'}`}>
            {m.delta}
          </p>
        </div>
      ))}
    </div>
  );
}

function CompareChart({ compare }) {
  return (
    <div className="sdgCompareList">
      {compare.map((c) => {
        const diff = c.after - c.before;
        const isWorse = diff < 0;
        const diffStr = `${diff > 0 ? '+' : ''}${diff}${c.unit === '%' ? 'pp' : ' pts'}`;
        return (
          <div key={c.label} className="sdgCompareItem">
            <div className="sdgCompareHead">
              <span className="sdgSubtle">{c.label}</span>
              <span className={isWorse ? 'sdgBad' : 'sdgGood'}>
                {diffStr}
              </span>
            </div>
            <div className="sdgProgressRow">
              <span className="sdgProgressLabel">Before</span>
              <div className="sdgProgressTrack">
                <div
                  className="sdgProgressFill sdgBefore"
                  style={{ width: `${c.before}%` }}
                />
              </div>
              <span className="sdgProgressVal">{c.before}{c.unit === '%' ? '%' : ''}</span>
            </div>
            <div className="sdgProgressRow">
              <span className="sdgProgressLabel">After</span>
              <div className="sdgProgressTrack">
                <div
                  className="sdgProgressFill"
                  style={{
                    width: `${c.after}%`,
                    background: isWorse ? '#d04545' : '#2f7a44',
                  }}
                />
              </div>
              <span className="sdgProgressVal">{c.after}{c.unit === '%' ? '%' : ''}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function CountryScores({ countries }) {
  return (
    <div className="sdgCountryList">
      {countries.map((c) => (
        <div key={c.name} className="sdgCountryRow">
          <span className="sdgCountryName">{c.name}</span>
          <div className="sdgCountryTrack">
            <div
              className="sdgCountryFill"
              style={{
                width: `${c.score}%`,
                background: c.score > 80 ? '#d04545' : c.score > 60 ? '#b16b19' : '#2f7a44',
              }}
            />
          </div>
          <span className="sdgCountryScore">{c.score}</span>
          <span className={`sdgTier ${TIER_STYLES[c.tier]}`}>
            {c.tier}
          </span>
        </div>
      ))}
    </div>
  );
}

function TrendLine({ trend, trendLabel }) {
  return (
    <div>
      <p className="sdgSubtle">{trendLabel}</p>
      <ResponsiveContainer width="100%" height={140}>
        <LineChart data={trend}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="year" tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 11 }} />
          <Tooltip />
          <Line
            type="monotone"
            dataKey="value"
            stroke="#d04545"
            strokeWidth={2}
            dot={{ r: 4, fill: '#d04545' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

function Timeline({ timeline }) {
  const dotColor = { critical: '#d04545', severe: '#b16b19', moderate: '#2f7a44' };
  return (
    <div className="sdgTimelineList">
      {timeline.map((t) => (
        <div key={t.year} className="sdgTimelineItem">
          <span className="sdgTimelineYear">{t.year}</span>
          <span
            className="sdgDot"
            style={{ background: dotColor[t.severity] }}
          />
          <span>{t.text}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Main Dashboard ────────────────────────────────────────────────────────────

const SDG_OPTIONS = [
  { value: 1, label: 'SDG 1 - No poverty' },
  { value: 2, label: 'SDG 2 - Zero hunger' },
  { value: 16, label: 'SDG 16 - Peace & justice' },
];

export default function SdgConflictDashboard() {
  const [activeSdg, setActiveSdg] = useState(1);
  const { data, loading, error, refetch } = useSdgConflict({ sdg: activeSdg });
  const sdg = data;

  return (
    <div className="sdgDashboardWrap">
      <div className="sdgHeader">
        <div>
          <p className="sdgSubtle">Conflict impact analytics</p>
          <h1 className="sdgTitle">Global Conflict Impact on SDGs</h1>
          {sdg && (
            <p className="sdgDescription">{sdg.description}</p>
          )}
        </div>
        <button
          onClick={refetch}
          className="sdgRefreshBtn"
        >
          Refresh
        </button>
      </div>

      <div className="sdgTabs">
        {SDG_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setActiveSdg(opt.value)}
            className={`sdgTabBtn ${
              activeSdg === opt.value
                ? 'sdgTabBtnActive'
                : ''
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {loading && (
        <div className="sdgStatus">
          Loading data...
        </div>
      )}
      {error && (
        <div className="sdgError">
          Error: {error}
        </div>
      )}

      {!loading && !error && sdg && (
        <>
          <MetricCards metrics={sdg.metrics} />

          <div className="sdgTwoColGrid">
            <div className="sdgPanel">
              <h3 className="sdgPanelTitle">
                Before vs after conflict
              </h3>
              <CompareChart compare={sdg.compare} />
            </div>
            <div className="sdgPanel">
              <h3 className="sdgPanelTitle">
                Country impact scores
              </h3>
              <CountryScores countries={sdg.countries} />
            </div>
          </div>

          <div className="sdgTwoColGrid">
            <div className="sdgPanel">
              <h3 className="sdgPanelTitle">
                5-year trend
              </h3>
              <TrendLine trend={sdg.trend} trendLabel={sdg.trendLabel} />
            </div>
            <div className="sdgPanel">
              <h3 className="sdgPanelTitle">
                Conflict timeline
              </h3>
              <Timeline timeline={sdg.timeline} />
            </div>
          </div>

          <div className="sdgSources">
            <span className="sdgSourceLead">Sources:</span>
            {sdg.meta.sources.map((s) => (
              <span
                key={s}
                className="sdgSourceTag"
              >
                {s}
              </span>
            ))}
          </div>
        </>
      )}
    </div>
  );
}