import Jsona from 'jsona';
import fetch from 'isomorphic-fetch';
import Router from 'next/router';
import isEmpty from 'lodash/isEmpty';
import compact from 'lodash/compact';

import { toastr } from 'react-redux-toastr';

// Utils
import { encode, decode, parseObjectSelectOptions } from 'utils/general';

/* Constants */
const GET_OBSERVATIONS_SUCCESS = 'GET_OBSERVATIONS_SUCCESS';
const GET_OBSERVATIONS_TOTAL_SIZE = 'GET_OBSERVATIONS_TOTAL_SIZE';
const GET_OBSERVATIONS_ERROR = 'GET_OBSERVATIONS_ERROR';
const GET_OBSERVATIONS_LOADING = 'GET_OBSERVATIONS_LOADING';

const GET_FILTERS_SUCCESS = 'GET_FILTERS_SUCCESS';
const GET_FILTERS_ERROR = 'GET_FILTERS_ERROR';
const GET_FILTERS_LOADING = 'GET_FILTERS_LOADING';
const SET_FILTERS = 'SET_FILTERS';
const SET_ACTIVE_COLUMNS = 'SET_ACTIVE_COLUMNS';
const SET_OBSERVATIONS_MAP_LOCATION = 'SET_OBSERVATIONS_MAP_LOCATION';
const SET_OBSERVATIONS_MAP_CLUSTER = 'SET_OBSERVATIONS_MAP_CLUSTER';

const OBS_MAX_SIZE = 3000;

/* Initial state */
const initialState = {
  data: [],
  totalSize: 0,
  loading: false,
  error: false,
  map: {
    zoom: 4,
    latitude: 0,
    longitude: 20
  },
  cluster: {},
  filters: {
    data: {
      observation_type: [],
      country_id: process.env.OTP_COUNTRIES_IDS,
      fmu_id: [],
      years: [],
      observer_id: [],
      category_id: [],
      subcategory_id: [],
      severity_level: [],
      validation_status: []
    },
    options: {},
    loading: false,
    error: false
  },
  columns: ['status', 'date', 'country', 'operator', 'category', 'observation', 'level', 'fmu', 'report']
};

const JSONA = new Jsona();

/* Reducer */
export default function (state = initialState, action) {
  switch (action.type) {
    case GET_OBSERVATIONS_SUCCESS:
      return Object.assign({}, state, {
        data: action.payload, loading: false, error: false
      });
    case GET_OBSERVATIONS_TOTAL_SIZE:
      return Object.assign({}, state, { totalSize: action.payload });
    case GET_OBSERVATIONS_ERROR:
      return Object.assign({}, state, { error: true, loading: false });
    case GET_OBSERVATIONS_LOADING:
      return Object.assign({}, state, { loading: true, error: false });
    // Filters
    case GET_FILTERS_SUCCESS: {
      const newFilters = Object.assign({}, state.filters, {
        options: action.payload, loading: false, error: false
      });
      return Object.assign({}, state, { filters: newFilters });
    }
    case GET_FILTERS_ERROR: {
      const newFilters = Object.assign({}, state.filters, { error: true, loading: false });
      return Object.assign({}, state, { filters: newFilters });
    }
    case GET_FILTERS_LOADING: {
      const newFilters = Object.assign({}, state.filters, { loading: true, error: false });
      return Object.assign({}, state, { filters: newFilters });
    }
    case SET_FILTERS: {
      const newFilters = Object.assign({}, state.filters, { data: action.payload });
      return Object.assign({}, state, { filters: newFilters });
    }
    case SET_ACTIVE_COLUMNS: {
      return Object.assign({}, state, { columns: action.payload });
    }
    case SET_OBSERVATIONS_MAP_LOCATION: {
      return Object.assign({}, state, { map: action.payload });
    }
    case SET_OBSERVATIONS_MAP_CLUSTER: {
      return Object.assign({}, state, { cluster: action.payload });
    }

    default:
      return state;
  }
}

/* Action creators */
export function getObservations() {
  return (dispatch, getState) => {
    const { language } = getState();
    const filters = getState().observations.filters.data;
    const filtersQuery = compact(Object.keys(filters).map((key) => {
      if (!isEmpty(filters[key])) {
        return `filter[${key}]=${filters[key].join(',')}`;
      }
      return null;
    }));

    const includes = ['country', 'subcategory', 'subcategory.category', 'operator', 'severity', 'fmu', 'observation-report', 'observers', 'observation-documents', 'relevant-operators'];

    // Fields
    const currentFields = { fmus: ['name'], operator: ['name'] };
    const fields = Object.keys(currentFields).map(f => `fields[${f}]=${currentFields[f]}`).join('&');
    const lang = language === 'zh' ? 'zh-CN' : language;

    const url = `${process.env.OTP_API}/observations?locale=${lang}&page[size]=${OBS_MAX_SIZE}&${fields}&include=${includes.join(',')}&${filtersQuery.join('&')}`;
    // Waiting for fetch from server -> Dispatch loading
    dispatch({ type: GET_OBSERVATIONS_LOADING });

    return fetch(url, {
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
      .then((observations) => {
        const dataParsed = JSONA.deserialize(observations);

        dispatch({
          type: GET_OBSERVATIONS_SUCCESS,
          payload: dataParsed
        });
      })
      .catch((err) => {
        // Fetch from server ko -> Dispatch error
        dispatch({
          type: GET_OBSERVATIONS_ERROR,
          payload: err.message
        });
      });
  };
}

export function getFilters() {
  return (dispatch, getState) => {
    const { language } = getState();

    // Waiting for fetch from server -> Dispatch loading
    dispatch({ type: GET_FILTERS_LOADING });

    const lang = language === 'zh' ? 'zh-CN' : language;

    return fetch(`${process.env.OTP_API}/observation_filters_tree?locale=${lang}`, {
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
      .then((filters) => {
        // Fetch from server ok -> Dispatch observations
        dispatch({
          type: GET_FILTERS_SUCCESS,
          payload: parseObjectSelectOptions(filters)
        });
      })
      .catch((err) => {
        // Fetch from server ko -> Dispatch error
        dispatch({
          type: GET_FILTERS_ERROR,
          payload: err.message
        });
      });
  };
}

export function getDownload() {
  return (dispatch, getState) => {
    const { language } = getState();
    const filters = getState().observations.filters.data;
    const filtersQuery = compact(Object.keys(filters).map((key) => {
      if (!isEmpty(filters[key])) {
        return `filter[${key}]=${filters[key].join(',')}`;
      }
      return null;
    }));

    const includes = ['country', 'subcategory', 'subcategory.category', 'operator', 'severity', 'fmu', 'observation-report', 'observers', 'relevant-operators'];

    // Fields
    const currentFields = { fmus: ['name'], operator: ['name'] };
    const fields = Object.keys(currentFields).map(f => `fields[${f}]=${currentFields[f]}`).join('&');
    const lang = language === 'zh' ? 'zh-CN' : language;

    const url = `${process.env.OTP_API}/observations-csv?locale=${lang}&${fields}&include=${includes.join(',')}&${filtersQuery.join('&')}`;

    return fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'text/csv',
        'OTP-API-KEY': process.env.OTP_API_KEY
      }
    })
      .then((response) => {
        if (response.ok) return response.text();
        toastr.error(this.props.intl.formatMessage({ id: 'Error' }), this.props.intl.formatMessage({ id: 'Oops! There was an error, try again' }));
      })
      .then((csv) => {
        if (csv) {
          const a = document.createElement('a');
          a.href = `data:text/csv;charset=utf-8,${encodeURI(csv)}`;
          a.target = '_blank';
          a.download = 'Observations.csv';
          a.click();
        }
      });
  };
}

export function setActiveColumns(activeColumns) {
  return (dispatch) => {
    dispatch({
      type: SET_ACTIVE_COLUMNS,
      payload: activeColumns
    });
  };
}

export function setFilters(filter) {
  return (dispatch, state) => {
    const newFilters = Object.assign({}, state().observations.filters.data);
    const key = Object.keys(filter)[0];
    newFilters[key] = filter[key];

    // default countries
    if (key === 'country_id' && !filter[key].length) {
      newFilters[key] = process.env.OTP_COUNTRIES_IDS;
    }

    dispatch({
      type: SET_FILTERS,
      payload: newFilters
    });
  };
}

export function setObservationsUrl() {
  return (dispatch, getState) => {
    const filters = getState().observations.filters.data;
    const query = {};

    Object.keys(filters).forEach((key) => {
      if (filters[key] && filters[key].length) query[key] = filters[key];
    });

    const location = {
      pathname: '/observations',
      query: {}
    };

    if (Object.keys(query).length) location.query.filters = encode(query);

    Router.replace(location);
  };
}

export function getObservationsUrl(url) {
  return (dispatch) => {
    const filters = url.query.filters;
    if (filters) {
      const payload = {
        ...decode(url.query.filters)
      };

      dispatch({
        type: SET_FILTERS,
        payload
      });
    }
  };
}

// SETTERS
export function setObservationsMapLocation(payload) {
  return {
    type: SET_OBSERVATIONS_MAP_LOCATION,
    payload
  };
}

// SETTERS
export function setObservationsMapCluster(payload) {
  return {
    type: SET_OBSERVATIONS_MAP_CLUSTER,
    payload
  };
}
