import Jsona from 'jsona';
import fetch from 'isomorphic-fetch';
import Router from 'next/router';
import isEmpty from 'lodash/isEmpty';
import compact from 'lodash/compact';

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

const OBS_MAX_SIZE = 3000;

/* Initial state */
const initialState = {
  data: [],
  totalSize: 0,
  loading: false,
  error: false,
  filters: {
    data: {
      observation_type: [],
      country_id: [7, 47],
      fmu_id: [],
      years: [],
      observer_id: [],
      category_id: [],
      severity_level: []
    },
    options: {},
    loading: false,
    error: false
  }
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
    default:
      return state;
  }
}

/* Action creators */
export function getObservations() {
  return (dispatch, getState) => {
    const filters = getState().observations.filters.data;
    const filtersQuery = compact(Object.keys(filters).map((key) => {
      if (!isEmpty(filters[key])) {
        return `filter[${key}]=${filters[key].join(',')}`;
      }
      return null;
    }));

    const includes = ['country', 'subcategory', 'subcategory.category', 'operator', 'severity'];

    const url = `${process.env.OTP_API}/observations?page[size]=${OBS_MAX_SIZE}&include=${includes.join(',')}&${filtersQuery.join('&')}`;
    // Waiting for fetch from server -> Dispatch loading
    dispatch({ type: GET_OBSERVATIONS_LOADING });

    fetch(url, {
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
  return (dispatch) => {
    // Waiting for fetch from server -> Dispatch loading
    dispatch({ type: GET_FILTERS_LOADING });

    fetch(`${process.env.OTP_API}/observation_filters`, {
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

export function setFilters(filter) {
  return (dispatch, state) => {
    const newFilters = Object.assign({}, state().observations.filters.data);
    const key = Object.keys(filter)[0];
    newFilters[key] = filter[key];

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
