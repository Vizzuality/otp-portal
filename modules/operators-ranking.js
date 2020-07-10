import Jsona from 'jsona';
import fetch from 'isomorphic-fetch';
import Router from 'next/router';

import groupBy from 'lodash/groupBy';
import flatten from 'lodash/flatten';

import { LAYERS } from 'constants/layers';

/* Constants */
const GET_OPERATORS_RANKING_SUCCESS = 'GET_OPERATORS_RANKING_SUCCESS';
const GET_OPERATORS_RANKING_ERROR = 'GET_OPERATORS_RANKING_ERROR';
const GET_OPERATORS_RANKING_LOADING = 'GET_OPERATORS_RANKING_LOADING';

const SET_OPERATORS_RANKING_MAP_LOCATION = 'SET_OPERATORS_RANKING_MAP_LOCATION';
const SET_OPERATORS_MAP_INTERACTIONS = 'SET_OPERATORS_MAP_INTERACTIONS';
const SET_OPERATORS_MAP_HOVER_INTERACTIONS = 'SET_OPERATORS_MAP_HOVER_INTERACTIONS';
const SET_OPERATORS_MAP_LAYERS_ACTIVE = 'SET_OPERATORS_MAP_LAYERS_ACTIVE';
const SET_OPERATORS_MAP_LAYERS_SETTINGS = 'SET_OPERATORS_MAP_LAYERS_SETTINGS';
const SET_OPERATORS_SIDEBAR = 'SET_OPERATORS_SIDEBAR';
const SET_FILTERS_RANKING = 'SET_FILTERS_RANKING';

const JSONA = new Jsona();

const COUNTRIES = [
  { label: 'Congo', value: 47, iso: 'COG' },
  { label: 'Democratic Republic of the Congo', value: 7, iso: 'COD' },
  { label: 'Cameroon', value: 45, iso: 'CMR' },
  { label: 'Central African Republic', value: 188, iso: 'CAF' },
  { label: 'Gabon', value: 53, iso: 'GAB' }
];

/* Initial state */
const initialState = {
  data: [],
  loading: false,
  error: false,

  map: {
    zoom: 4,
    latitude: 0,
    longitude: 20
  },

  latlng: {},

  interactions: {},

  hoverInteractions: {},

  // LAYERS
  layers: LAYERS,
  layersActive: [
    'gain',
    'loss',
    'glad',
    'fmus',
    'protected-areas'
  ],
  layersSettings: {},

  // SIDEBAR
  sidebar: {
    open: true,
    width: 600
  },

  // FILTERS
  filters: {
    data: {
      fa: true,
      country: [],
      certification: [],
      operator: ''
    },

    options: {
      country: process.env.OTP_COUNTRIES.map(iso =>
        COUNTRIES.find(c => c.iso === iso)
      ),
      certification: [
        { label: 'FSC', value: 'fsc' },
        { label: 'PEFC', value: 'pefc' },
        { label: 'OLB', value: 'olb' },
        { label: 'FSC-CW', value: 'fsc-cw' },
        { label: 'PAFC', value: 'pafc' },
        { label: 'TLV', value: 'tlv' },
        { label: 'LS', value: 'ls' }
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

    case SET_OPERATORS_SIDEBAR: {
      const { open, width } = action.payload;

      const sidebar = {
        open, width
      };

      return {
        ...state,
        sidebar
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

/* Action creators */
export function getOperatorsRanking() {
  return (dispatch, getState) => {
    const { language } = getState();
    // Waiting for fetch from server -> Dispatch loading
    dispatch({ type: GET_OPERATORS_RANKING_LOADING });

    // Filters
    const includes = [
      'observations',
      'fmus',
      'country'
    ].join(',');

    // Fields
    const currentFields = { fmus: [
      'name',
      'certification-fsc',
      'certification-olb',
      'certification-pefc',
      'certification-pafc',
      'certification-fsc-cw',
      'certification-tlv',
      'certification-ls'
    ] };
    const fields = Object.keys(currentFields).map(f => `fields[${f}]=${currentFields[f]}`).join('&');

    // Filters
    const filters = `&filter[fa]=true&filter[country]=${process.env.OTP_COUNTRIES_IDS.join(',')}`;

    const lang = language === 'zh' ? 'zh-CN' : language;

    return fetch(`${process.env.OTP_API}/operators?locale=${lang}&page[size]=2000&${fields}&include=${includes}${filters}`, {
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

        const groupByDocPercentage = groupBy(dataParsed, (o) => {
          if (typeof o['percentage-valid-documents-all'] !== 'number') return 0;

          return o['percentage-valid-documents-all'];
        });
        const groupByDocPercentageKeys = Object.keys(groupByDocPercentage).sort().reverse();
        const rankedData = flatten(groupByDocPercentageKeys.map((k, i) => {
          return groupByDocPercentage[k].map(o => ({
            ...o,
            ranking: i
          }));
        }));


        dispatch({
          type: GET_OPERATORS_RANKING_SUCCESS,
          payload: rankedData
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

export function setOperatorsSidebar(payload) {
  return {
    type: SET_OPERATORS_SIDEBAR,
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
  };
}

export function getGladMaxDate() {
  return (dispatch) => {
    return fetch('https://production-api.globalforestwatch.org/v1/glad-alerts/latest', {
      method: 'GET'
    })
      .then((response) => {
        if (response.ok) return response.json();
        throw new Error(response.statusText);
      })
      .then(({ data }) => {
        dispatch({
          type: SET_OPERATORS_MAP_LAYERS_SETTINGS,
          payload: {
            id: 'glad',
            settings: {
              decodeParams: {
                endDate: data[0].attributes.date,
                trimEndDate: data[0].attributes.date,
                maxDate: data[0].attributes.date
              },
              timelineParams: {
                maxDate: data[0].attributes.date
              }
            }
          }
        });
      })
      .catch((err) => {
        console.error(err);

        const date = new Date();
        // Fetch from server ko -> Dispatch error
        dispatch({
          type: SET_OPERATORS_MAP_LAYERS_SETTINGS,
          payload: {
            id: 'glad',
            settings: {
              decodeParams: {
                endDate: date.toISOString(),
                trimEndDate: date.toISOString(),
                maxDate: date.toISOString()
              },
              timelineParams: {
                maxDate: date.toISOString()
              }
            }
          }
        });
      });
  };
}
