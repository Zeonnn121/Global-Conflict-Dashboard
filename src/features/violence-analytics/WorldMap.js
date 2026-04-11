import React, { useState } from 'react';
import { ComposableMap, Geographies, Geography } from 'react-simple-maps';
import data from '../../data.json';

const geoUrl = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json';

function normalizeCountryName(value) {
  if (!value) return '';
  return String(value)
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\s*\(.*?\)\s*/g, ' ')
    .replace(/[^a-z\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// Aliases help when the map's country labels don't match your dataset.
// Keys/values must be normalized via normalizeCountryName().
const COUNTRY_ALIASES = {
  [normalizeCountryName('United States of America')]: normalizeCountryName('United States'),
  [normalizeCountryName('Russian Federation')]: normalizeCountryName('Russia'),
  [normalizeCountryName('Syrian Arab Republic')]: normalizeCountryName('Syria'),
  [normalizeCountryName('Iran (Islamic Republic of)')]: normalizeCountryName('Iran'),
  [normalizeCountryName('Viet Nam')]: normalizeCountryName('Vietnam'),
  [normalizeCountryName("Côte d'Ivoire")]: normalizeCountryName("Cote d'Ivoire"),
  [normalizeCountryName('Ivory Coast')]: normalizeCountryName("Cote d'Ivoire"),
  [normalizeCountryName('United Republic of Tanzania')]: normalizeCountryName('Tanzania'),
  [normalizeCountryName("Lao People's Democratic Republic")]: normalizeCountryName('Laos'),
  [normalizeCountryName("Democratic People's Republic of Korea")]: normalizeCountryName('North Korea'),
  [normalizeCountryName('Republic of Korea')]: normalizeCountryName('South Korea'),
  [normalizeCountryName('Bolivia (Plurinational State of)')]: normalizeCountryName('Bolivia'),
  [normalizeCountryName('Venezuela (Bolivarian Republic of)')]: normalizeCountryName('Venezuela'),
  [normalizeCountryName('Democratic Republic of the Congo')]: normalizeCountryName('DR Congo'),
  [normalizeCountryName('Republic of the Congo')]: normalizeCountryName('Congo'),
};

const DATA_BY_COUNTRY = (() => {
  const map = new Map();
  for (const row of data) {
    const key = normalizeCountryName(row.Country);
    if (!key) continue;
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(row);
  }
  return map;
})();

export function WorldMap() {
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [hoveredCountry, setHoveredCountry] = useState(null);

  const getCountryIncidents = (countryName) => {
    const normalized = normalizeCountryName(countryName);
    const alias = COUNTRY_ALIASES[normalized] || normalized;
    return DATA_BY_COUNTRY.get(alias) || [];
  };

  const handleCountryClick = (geo) => {
    const countryName = geo.properties.name;
    const incidents = getCountryIncidents(countryName);

    setSelectedCountry({
      name: countryName,
      incidents,
    });
  };

  return (
    <div className="map-container">
      <h2>World map</h2>
      <p className="subtitle">Click a country to view incidents</p>

      <div className="map-wrapper">
        <ComposableMap projection="geoMercator">
          <Geographies geography={geoUrl}>
            {({ geographies }) =>
              geographies.map((geo) => {
                const countryName = geo.properties.name;
                const incidents = getCountryIncidents(countryName);
                const isSelected = selectedCountry?.name === countryName;
                const isHovered = hoveredCountry === countryName;
                const hasData = incidents.length > 0;

                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    onClick={() => handleCountryClick(geo)}
                    onMouseEnter={() => setHoveredCountry(countryName)}
                    onMouseLeave={() => setHoveredCountry(null)}
                    style={{
                      default: {
                        fill: hasData
                          ? isSelected
                            ? '#111827'
                            : isHovered
                              ? '#6b7280'
                              : '#e5e7eb'
                          : '#f3f4f6',
                        stroke: isSelected ? '#111827' : '#d1d5db',
                        strokeWidth: isSelected ? 2 : 0.75,
                        outline: 'none',
                        cursor: hasData ? 'pointer' : 'help',
                        transition: 'all 0.2s ease',
                      },
                      hover: {
                        fill: hasData ? '#6b7280' : '#f3f4f6',
                        stroke: '#111827',
                        strokeWidth: hasData ? 1.5 : 0.75,
                        outline: 'none',
                        cursor: hasData ? 'pointer' : 'help',
                      },
                      pressed: {
                        fill: '#111827',
                        stroke: '#111827',
                        strokeWidth: 2,
                        outline: 'none',
                      },
                    }}
                  />
                );
              })
            }
          </Geographies>
        </ComposableMap>
      </div>

      {selectedCountry && (
        <div className="country-details">
          <div className="details-header">
            <h3>{selectedCountry.name}</h3>
            <button className="close-btn" onClick={() => setSelectedCountry(null)}>
              ✕
            </button>
          </div>

          {selectedCountry.incidents.length === 0 ? (
            <div className="no-data">
              <div className="no-data-title">No incident data available</div>
              <div className="no-data-subtitle">
                This country isn’t present in your current dataset.
              </div>
            </div>
          ) : (
            <div className="incidents-table">
              <table>
                <thead>
                  <tr>
                    <th>Year</th>
                    <th>Events</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedCountry.incidents
                    .slice()
                    .sort((a, b) => a.Year - b.Year)
                    .map((incident, idx) => (
                      <tr key={idx}>
                        <td>{incident.Year}</td>
                        <td className="event-count">{Number(incident.Events).toLocaleString()}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
              <div className="incidents-summary">
                <strong>
                  Total Events:{' '}
                  {selectedCountry.incidents
                    .reduce((sum, i) => sum + Number(i.Events || 0), 0)
                    .toLocaleString()}
                </strong>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
