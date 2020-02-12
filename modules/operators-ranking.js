import Jsona from 'jsona';
import fetch from 'isomorphic-fetch';
import Router from 'next/router';
import compact from 'lodash/compact';

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
  layers: LAYERS,
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
    // THIS IS SATAN!!!!
    if (f === 'country' && !filters[f].length) {
      return `filter[${f}]=[188,53]}`;
    }

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
    const { language } = getState();
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

    const lang = language === 'zh' ? 'zh-CN' : language;

    fetch(`${process.env.OTP_API}/operators?locale=${lang}&page[size]=2000&${fields}&include=${includes}${filters}`, {
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
