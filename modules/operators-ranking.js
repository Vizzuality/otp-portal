import Jsona from 'jsona';
import fetch from 'isomorphic-fetch';
import Router from 'next/router';
import compact from 'lodash/compact';

import * as Cookies from 'js-cookie';

/* Constants */
const GET_OPERATORS_RANKING_SUCCESS = 'GET_OPERATORS_RANKING_SUCCESS';
const GET_OPERATORS_RANKING_ERROR = 'GET_OPERATORS_RANKING_ERROR';
const GET_OPERATORS_RANKING_LOADING = 'GET_OPERATORS_RANKING_LOADING';

const SET_OPERATORS_RANKING_MAP_LOCATION = 'SET_OPERATORS_RANKING_MAP_LOCATION';
const SET_OPERATORS_MAP_INTERACTIONS = 'SET_OPERATORS_MAP_INTERACTIONS';
const SET_OPERATORS_MAP_HOVER_INTERACTIONS = 'SET_OPERATORS_MAP_HOVER_INTERACTIONS';
const SET_OPERATORS_MAP_LAYERS_ACTIVE = 'SET_OPERATORS_MAP_LAYERS_ACTIVE';
const SET_OPERATORS_MAP_LAYERS_SETTINGS = 'SET_OPERATORS_MAP_LAYERS_SETTINGS';
const SET_FILTERS_RANKING = 'SET_FILTERS_RANKING';

const JSONA = new Jsona();

/* Initial state */
const initialState = {
  data: [],
  loading: false,
  error: false,

  map: {
    zoom: 5,
    latitude: 0,
    longitude: 20
  },

  latlng: {},

  interactions: {},

  hoverInteractions: {},

  // LAYERS
  layers: [
    {
      id: 'gain',
      name: 'Tree cover gain',
      config: {
        type: 'raster',
        source: {
          tiles: [
            'http://earthengine.google.org/static/hansen_2013/gain_alpha/{z}/{x}/{y}.png'
          ],
          minzoom: 3,
          maxzoom: 12
        }
      },
      legendConfig: {
        type: 'basic',
        items: [
          { name: 'Tree cover gain', color: '#6D6DE5' }
        ]
      }
    },
    {
      id: 'loss',
      name: 'Tree cover loss',
      config: {
        type: 'raster',
        source: {
          tiles: [
            'https://storage.googleapis.com/wri-public/Hansen_16/tiles/hansen_world/v1/tc30/{z}/{x}/{y}.png'
          ],
          minzoom: 3,
          maxzoom: 12
        }
      },
      legendConfig: {
        enabled: true
      },
      decodeConfig: [
        {
          default: '2001-01-01',
          key: 'startDate',
          required: true
        },
        {
          default: '2018-12-31',
          key: 'endDate',
          required: true
        }
      ],
      timelineConfig: {
        step: 1,
        speed: 250,
        interval: 'years',
        dateFormat: 'YYYY',
        trimEndDate: '2018-12-31',
        maxDate: '2018-12-31',
        minDate: '2001-01-01',
        canPlay: true,
        railStyle: {
          background: '#DDD'
        },
        trackStyle: [
          {
            background: '#dc6c9a'
          },
          {
            background: '#982d5f'
          }
        ]
      },
      decodeFunction: `
        // values for creating power scale, domain (input), and range (output)
        float domainMin = 0.;
        float domainMax = 255.;
        float rangeMin = 0.;
        float rangeMax = 255.;

        float exponent = zoom < 13. ? 0.3 + (zoom - 3.) / 20. : 1.;
        float intensity = color.r * 255.;

        // get the min, max, and current values on the power scale
        float minPow = pow(domainMin, exponent - domainMin);
        float maxPow = pow(domainMax, exponent);
        float currentPow = pow(intensity, exponent);

        // get intensity value mapped to range
        float scaleIntensity = ((currentPow - minPow) / (maxPow - minPow) * (rangeMax - rangeMin)) + rangeMin;
        // a value between 0 and 255
        alpha = zoom < 13. ? scaleIntensity / 255. : color.g;

        float year = 2000.0 + (color.b * 255.);
        // map to years
        if (year >= startYear && year <= endYear && year >= 2001.) {
          color.r = 220. / 255.;
          color.g = (72. - zoom + 102. - 3. * scaleIntensity / zoom) / 255.;
          color.b = (33. - zoom + 153. - intensity / zoom) / 255.;
        } else {
          alpha = 0.;
        }
      `
    },
    {
      id: 'glad',
      name: 'GLAD alerts',
      config: {
        type: 'raster',
        source: {
          tiles: [
            'https://tiles.globalforestwatch.org/glad_prod/tiles/{z}/{x}/{y}.png'
          ],
          minzoom: 2,
          maxzoom: 12
        }
      },
      legendConfig: {
        enabled: true
      },
      decodeConfig: [
        {
          default: '2015-01-01',
          key: 'startDate',
          required: true
        },
        {
          default: '2020-01-30',
          key: 'endDate',
          required: true,
          url: 'https://production-api.globalforestwatch.org/v1/glad-alerts/latest'
        },
        {
          default: 1,
          key: 'confirmedOnly',
          required: true
        }
      ],
      decodeFunction: `
        // values for creating power scale, domain (input), and range (output)
        float confidenceValue = 0.;
        if (confirmedOnly > 0.) {
          confidenceValue = 200.;
        }
        float day = color.r * 255. * 255. + (color.g * 255.);
        float confidence = color.b * 255.;
        if (
          day > 0. &&
          day >= startDayIndex &&
          day <= endDayIndex &&
          confidence >= confidenceValue
        ) {
          // get intensity
          float intensity = mod(confidence, 100.) * 50.;
          if (intensity > 255.) {
            intensity = 255.;
          }
          if (day >= numberOfDays - 7. && day <= numberOfDays) {
            color.r = 255. / 255.;
            color.g = 255. / 255.;
            color.b = 0.;
            alpha = intensity / 255.;
          } else {
            color.r = 255. / 255.;
            color.g = 0. / 255.;
            color.b = 0. / 255.;
            alpha = intensity / 255.;
          }
        } else {
          alpha = 0.;
        }
      `,
      timelineConfig: {
        step: 7,
        speed: 100,
        interval: 'days',
        dateFormat: 'YYYY-MM-DD',
        trimEndDate: '2020-01-30',
        maxDate: '2020-01-30',
        minDate: '2015-01-01',
        canPlay: true,
        railStyle: {
          background: '#DDD'
        },
        trackStyle: [
          {
            background: '#dc6c9a'
          },
          {
            background: '#982d5f'
          }
        ]
      }

    },
    {
      id: 'fmus',
      name: 'Forest managment units',
      config: {
        type: 'geojson',
        source: {
          type: 'geojson',
          data: `${process.env.OTP_API}/fmus?country_ids=7,47,45,188,53&format=geojson`
        },
        render: {
          layers: [
            {
              type: 'fill',
              source: 'fmus',
              paint: {
                'fill-color': {
                  property: 'fmu_type_label',
                  type: 'categorical',
                  stops: [
                    ['ventes_de_coupe', '#e92000'],
                    ['ufa', '#e95800'],
                    ['communal', '#e9A600'],
                    ['PEA', '#e9D400'],
                    ['CPAET', '#e9E200'],
                    ['CFAD', '#e9FF00']
                  ],
                  default: '#e98300'
                },
                'fill-opacity': 0.9
              }
            },
            {
              type: 'line',
              source: 'fmus',
              paint: {
                'line-color': '#000000',
                'line-opacity': 0.1
              }
            }
          ]
        }
      },
      legendConfig: {
        type: 'basic',
        color: '#e98300',
        items: [
          {
            name: 'FMUs',
            color: '#e98300'
          },
          {
            name: 'Cameroon',
            hideIcon: true,
            items: [
              { name: 'ventes_de_coupe', color: '#e92000' },
              { name: 'ufa', color: '#e95800' },
              { name: 'communal', color: '#e9A700' }
            ]
          },
          {
            name: 'Central African Republic',
            hideIcon: true,
            items: [
              { name: 'PEA', color: '#e9D400' }
            ]
          },
          {
            name: 'Gabon',
            hideIcon: true,
            items: [
              { name: 'CPAET', color: '#e9F200' },
              { name: 'CFAD', color: '#e9FF00' }
            ]
          }
        ]
      },
      interactionConfig: {
        enable: true,
        output: [
          {
            column: 'fmu_name',
            label: 'Name'
          },
          {
            column: 'fmu_type_label',
            label: 'Type'
          },
          {
            column: 'company_na',
            label: 'Producer'
          }
        ]
      }
    },
    {
      id: 'protected-areas',
      name: 'Protected areas',
      config: {
        type: 'vector',
        source: {
          type: 'vector',
          provider: {
            type: 'carto',
            options: {
              account: 'wri-01',
              layers: [
                {
                  options: {
                    cartocss: '#wdpa_protected_areas {  polygon-opacity: 1.0; polygon-fill: #704489 }',
                    cartocss_version: '2.3.0',
                    sql: 'SELECT * FROM wdpa_protected_areas'
                  },
                  type: 'cartodb'
                }
              ]
            }
          }
        },
        render: {
          layers: [
            {
              type: 'fill',
              'source-layer': 'layer0',
              paint: {
                'fill-color': '#5ca2d1',
                'fill-opacity': 1
              }
            },
            {
              type: 'line',
              'source-layer': 'layer0',
              paint: {
                'line-color': '#000000',
                'line-opacity': 0.1
              }
            }
          ]
        }
      },
      legendConfig: {
        type: 'basic',
        items: [
          { name: 'Protected areas', color: '#5ca2d1' }
        ]
      }
    }
  ],
  layersActive: [
    'gain',
    'loss',
    'glad',
    'fmus',
    'protected-areas'
  ],
  layersSettings: {},

  // FILTERS
  filters: {
    data: {
      fa: true,
      country: []
    },
    // TODO: get them from API
    options: {
      country: [
        { label: 'Congo', value: 47, iso: 'COG' },
        { label: 'Democratic Republic of the Congo', value: 7, iso: 'COD' },
        { label: 'Cameroon', value: 45, iso: 'CMR' },
        { label: 'Central African Republic', value: 188, iso: 'CAF' },
        { label: 'Gabon', value: 53, iso: 'GAB' }
      ],
      certification: [
        { label: 'FSC', value: 'fsc' },
        { label: 'PEFC', value: 'pefc' },
        { label: 'OLB', value: 'olb' },
        { label: 'VLC', value: 'vlc' },
        { label: 'VLO', value: 'vlo' },
        { label: 'TLTV', value: 'tltv' }
      ]
    },
    loading: false,
    error: false
  }
};

/* Reducer */
export default function (state = initialState, action) {
  switch (action.type) {
    case GET_OPERATORS_RANKING_SUCCESS:
      return Object.assign({}, state, { data: action.payload, loading: false, error: false });
    case GET_OPERATORS_RANKING_ERROR:
      return Object.assign({}, state, { error: true, loading: false });
    case GET_OPERATORS_RANKING_LOADING:
      return Object.assign({}, state, { loading: true, error: false });
    case SET_OPERATORS_RANKING_MAP_LOCATION:
      return Object.assign({}, state, { map: action.payload });
    case SET_OPERATORS_MAP_INTERACTIONS: {
      const { features = [], lngLat = [] } = action.payload;

      const interactions = features.reduce(
        (obj, next) => ({
          ...obj,
          [next.layer.source]: {
            id: next.id,
            data: next.properties,
            geometry: next.geometry
          }
        }),
        {}
      );

      return {
        ...state,
        latlng: {
          lat: lngLat[1],
          lng: lngLat[0]
        },
        interactions
      };
    }
    case SET_OPERATORS_MAP_HOVER_INTERACTIONS: {
      const { features = [] } = action.payload;
      const hoverInteractions = features.reduce(
        (obj, next) => ({
          ...obj,
          [next.layer.source]: {
            id: next.id,
            data: next.properties,
            geometry: next.geometry
          }
        }),
        {}
      );

      return {
        ...state,
        hoverInteractions
      };
    }
    case SET_OPERATORS_MAP_LAYERS_SETTINGS: {
      const { id, settings } = action.payload;

      const layersSettings = {
        ...state.layersSettings,
        [id]: {
          ...state.layersSettings[id],
          ...settings
        }
      };

      return {
        ...state,
        layersSettings
      };
    }

    case SET_FILTERS_RANKING: {
      const newFilters = Object.assign({}, state.filters, { data: action.payload });
      return Object.assign({}, state, { filters: newFilters });
    }
    default:
      return state;
  }
}

/* Helpers */
const getSQLFilters = (filters) => {
  const sql = compact(Object.keys(filters).map((f) => {
    if ((Array.isArray(filters[f]) && filters[f].length)) {
      return `filter[${f}]=${filters[f]}`;
    }

    if (!(Array.isArray(filters[f]) && !!filters[f])) {
      return `filter[${f}]=${filters[f]}`;
    }

    return null;
  })).join('&');

  return (sql) ? `&${sql}` : '';
};

/* Action creators */
export function getOperatorsRanking() {
  return (dispatch, getState) => {
    // Waiting for fetch from server -> Dispatch loading
    dispatch({ type: GET_OPERATORS_RANKING_LOADING });

    // Filters
    const includes = [
      'observations',
      'fmus'
    ].join(',');

    // Fields
    const currentFields = { fmus: [
      'certification-fsc',
      'certification-olb',
      'certification-pefc',
      'certification-vlc',
      'certification-vlo',
      'certification-tltv'
    ] };
    const fields = Object.keys(currentFields).map(f => `fields[${f}]=${currentFields[f]}`).join('&');

    // Filters
    const filters = getSQLFilters(getState().operatorsRanking.filters.data);

    const language = Cookies.get('language') === 'zh' ? 'zh-CN' : Cookies.get('language');

    fetch(`${process.env.OTP_API}/operators?locale=${language}&page[size]=2000&${fields}&include=${includes}${filters}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'OTP-API-KEY': process.env.OTP_API_KEY
      }
    })
      .then((response) => {
        if (response.ok) return response.json();
        throw new Error(response.statusText);
      })
      .then((operatorsRanking) => {
        const dataParsed = JSONA.deserialize(operatorsRanking);

        dispatch({
          type: GET_OPERATORS_RANKING_SUCCESS,
          payload: dataParsed
        });
      })
      .catch((err) => {
        console.error(err);
        // Fetch from server ko -> Dispatch error
        dispatch({
          type: GET_OPERATORS_RANKING_ERROR,
          payload: err.message
        });
      });
  };
}

export function setOperatorsUrl(mapLocation) {
  return () => {
    const location = {
      pathname: '/operators',
      query: {
        latitude: mapLocation.latitude.toFixed(2),
        longitude: mapLocation.longitude.toFixed(2),
        zoom: mapLocation.zoom.toFixed(2)
      }
    };

    Router.replace(location);
  };
}

export function getOperatorsUrl(url) {
  const { zoom, lat, lng, latitude, longitude } = url.query;

  return {
    zoom: +zoom || initialState.map.zoom,
    latitude: +latitude || +lat || initialState.map.latitude,
    longitude: +longitude || +lng || initialState.map.longitude
  };
}


// SETTERS
export function setOperatorsMapLocation(payload) {
  return {
    type: SET_OPERATORS_RANKING_MAP_LOCATION,
    payload
  };
}

export function setOperatorsMapInteractions(payload) {
  return {
    type: SET_OPERATORS_MAP_INTERACTIONS,
    payload
  };
}

export function setOperatorsMapHoverInteractions(payload) {
  return {
    type: SET_OPERATORS_MAP_HOVER_INTERACTIONS,
    payload
  };
}

export function setOperatorsMapLayersActive(payload) {
  return {
    type: SET_OPERATORS_MAP_LAYERS_ACTIVE,
    payload
  };
}

export function setOperatorsMapLayersSettings(payload) {
  return {
    type: SET_OPERATORS_MAP_LAYERS_SETTINGS,
    payload
  };
}

export function setFilters(filter) {
  return (dispatch, state) => {
    const newFilters = Object.assign({}, state().operatorsRanking.filters.data);
    const key = Object.keys(filter)[0];
    newFilters[key] = filter[key];

    dispatch({
      type: SET_FILTERS_RANKING,
      payload: newFilters
    });

    dispatch(getOperatorsRanking());
  };
}
