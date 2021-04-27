// Constants
import { PALETTE_COLOR_1, LEGEND_SEVERITY } from 'constants/rechart';
import { LAYERS } from 'constants/layers';
import isEmpty from 'lodash/isEmpty';
import sortBy from 'lodash/sortBy';
import { createSelector } from 'reselect';
import { spiderifyCluster } from 'components/map-new/layer-manager/utils';

const FMU_LEGEND = [
  {
    name: 'Cameroon',
    iso: 'CMR',
    color: '#007A5E',
    items: [
      { name: 'ventes_de_coupe', color: '#8BC2B5' },
      { name: 'ufa', color: '#007A5E' },
      { name: 'communal', color: '#00382B' }
    ]
  },
  {
    name: 'Central African Republic',
    iso: 'CAF',
    color: '#e9D400'
  },
  {
    name: 'Congo',
    iso: 'COG',
    color: '#7B287D'
  },
  {
    name: 'Democratic Republic of the Congo',
    iso: 'COD',
    color: '#5ca2d1'
  },
  {
    name: 'Gabon',
    iso: 'GAB',
    color: '#e95800',
    items: [
      { name: 'CPAET', color: '#e95800' },
      { name: 'CFAD', color: '#e9A600' }
    ]
  }
];

const intl = (state, props) => props && props.intl;

// Get the datasets and filters from state
const observations = state => state.observations.data;
const cluster = state => state.observations.cluster;
const zoom = state => state.observations.map.zoom;

const getLocation = (obs = {}) => {
  if (obs.lat && obs.lng) {
    return [
      Number(obs.lng),
      Number(obs.lat),
    ];
  }


  // if (obs.fmu) {
  //   console.log(obs);
  // }

  // if (obs.country && obs.country['country-centroid']) {
  //   const centroid = obs.country['country-centroid'];

  //   return [
  //     centroid.coordinates[0],
  //     centroid.coordinates[1]
  //   ];
  // }
  return null;
};

// Create a function to compare the current active datatasets and the current datasetsIds
const getObservationsLayers = createSelector(
  observations, cluster, zoom,
  (_observations, _cluster, _zoom) => {
    if (_observations) {
      let clusterLayers = [];
      const features = _observations.filter(o => {
        return getLocation(o);
      });

      if (!isEmpty(_cluster)) {
        const spider = spiderifyCluster({ ..._cluster, zoom: _zoom });
        clusterLayers = Object.keys(spider).map((key) => {
          return {
            id: `observations-${key}`,
            type: 'geojson',
            source: {
              type: 'geojson',
              data: spider[key]
            },
            render: {
              ...key === 'leaves' && {
                layers: [
                  {
                    metadata: {
                      position: 'top'
                    },
                    type: 'circle',
                    paint: {
                      'circle-radius': 6,
                      'circle-stroke-width': 1,
                      'circle-stroke-color': '#333',
                      'circle-color': [
                        'match',
                        ['get', 'level'],
                        0,
                        PALETTE_COLOR_1[0].fill,
                        1,
                        PALETTE_COLOR_1[1].fill,
                        2,
                        PALETTE_COLOR_1[2].fill,
                        3,
                        PALETTE_COLOR_1[3].fill,
                        /* other */
                        '#ccc'
                      ]
                    }
                  }
                ]
              },
              ...key === 'legs' && {
                layers: [
                  {
                    metadata: {
                      position: 'top'
                    },
                    type: 'line',
                    paint: {
                      'line-width': 1,
                      'line-color': 'rgba(128, 128, 128, 0.5)'
                    }
                  }
                ]
              }
            }
          };
        });
      }

      const FMUS_LAYER = (LAYERS.find(l => l.id === 'fmus'));

      return [
        ...clusterLayers,
        {
          ...FMUS_LAYER,
          ...FMUS_LAYER.config,
          opacity: _zoom/8 > 1 ? 1 : _zoom/4/8,
          params: {
            country_iso_codes: process.env.OTP_COUNTRIES
          }
        },
        {
          id: 'observations',
          type: 'geojson',
          source: {
            type: 'geojson',
            data: {
              type: 'FeatureCollection',
              features: features.map(obs => ({
                type: 'Feature',
                properties: {
                  id: obs.id,
                  date: new Date(obs['publication-date']).getFullYear(),
                  country: obs.country.iso,
                  operator: !!obs.operator && obs.operator.name,
                  category: obs?.subcategory?.category?.name,
                  observation: obs.details,
                  level: obs.severity && obs.severity.level,
                  fmu: !!obs.fmu && obs.fmu.name,
                  report: obs['observation-report'] ? obs['observation-report'].attachment.url : null,
                  'operator-type': obs.operator && obs.operator.type,
                  subcategory: obs?.subcategory?.name,
                  evidence: obs.evidence,
                  'litigation-status': obs['litigation-status'],
                  'observer-types': obs.observers.map(observer => observer['observer-type']),
                  'observer-organizations': obs.observers.map(observer => observer.organization)
                },
                geometry: {
                  type: 'Point',
                  coordinates: getLocation(obs)
                }
              }))
            },
            maxzoom: 24,
            cluster: true,
            clusterMaxZoom: 23,
            clusterRadius: 45
          },
          render: {
            layers: [
              {
                metadata: {
                  cluster: true,
                  position: 'top'
                },
                type: 'circle',
                filter: ['has', 'point_count'],
                paint: {
                  'circle-color': '#FFF',
                  'circle-stroke-width': 2,
                  'circle-stroke-color': [
                    'case',
                    [
                      'boolean',
                      ['feature-state', 'hover'],
                      false
                    ],
                    '#000',
                    '#5ca2d1'
                  ],
                  'circle-radius': 12
                }
              },
              {
                metadata: {
                  cluster: true,
                  position: 'top'
                },
                type: 'symbol',
                filter: ['has', 'point_count'],
                layout: {
                  'text-allow-overlap': true,
                  'text-ignore-placement': true,
                  'text-field': '{point_count_abbreviated}',
                  'text-size': 12
                }
              },
              {
                metadata: {
                  position: 'top'
                },
                type: 'circle',
                filter: ['!has', 'point_count'],
                paint: {
                  'circle-radius': 8,
                  'circle-stroke-width': 2,
                  'circle-stroke-color': '#333',
                  'circle-color': [
                    'match',
                    ['get', 'level'],
                    0,
                    PALETTE_COLOR_1[0].fill,
                    1,
                    PALETTE_COLOR_1[1].fill,
                    2,
                    PALETTE_COLOR_1[2].fill,
                    3,
                    PALETTE_COLOR_1[3].fill,
                    /* other */
                    '#ccc'
                  ]
                }
              }
            ]
          }
        }
      ];
    }

    return [];
  }
);


const getObservationsLegend = createSelector(
  observations, intl,
  (_observations, _intl) => {

    if (!_intl) return [];

    const FMUS_LAYER = (LAYERS.find(l => l.id === 'fmus'));
    const { legendConfig } = FMUS_LAYER;

    return [
      {
        id: 'fmus',
        dataset: 'fmus',
        name: _intl.formatMessage({ id: 'fmus' }),
        layers: [
          {
            opacity: 1,
            active: true,
            name: _intl.formatMessage({ id: 'fmus' }),
            legendConfig: {
              ...legendConfig,
              ...legendConfig.items && {
                items: sortBy(legendConfig.items.map(i => ({
                  ...i,
                  ...i.name && { name: _intl.formatMessage({ id: i.name || '-' }) },
                  ...i.items && {
                    items: i.items.map(ii => ({
                      ...ii,
                      ...ii.name && { name: _intl.formatMessage({ id: ii.name || '-' }) }
                    }))
                  }

                })), 'name')
              }
            }
          }
        ]
      },
      {
        id: 'severity',
        dataset: 'severity',
        name: _intl.formatMessage({ id: 'severity' }),
        layers: [
          {
            opacity: 1,
            active: true,
            name: _intl.formatMessage({ id: 'severity' }),
            legendConfig: {
              type: 'basic',
              items: LEGEND_SEVERITY.list.map(l => ({
                name: _intl.formatMessage({ id: l.label }),
                color: l.fill
              }))
            }
          }
        ]
      }
    ]
  }
);




export { getObservationsLayers, getObservationsLegend };
