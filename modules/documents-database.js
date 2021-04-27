import Jsona from 'jsona';
import fetch from 'isomorphic-fetch';
import Router from 'next/router';
import isEmpty from 'lodash/isEmpty';
import compact from 'lodash/compact';

// Utils
import { encode, decode, parseObjectSelectOptions } from 'utils/general';

/* Constants */
const GET_DOCUMENTS_DB_SUCCESS = 'GET_DOCUMENTS_DB_SUCCESS';
const GET_DOCUMENTS_DB_TOTAL_SIZE = 'GET_DOCUMENTS_DB_TOTAL_SIZE';
const GET_DOCUMENTS_DB_ERROR = 'GET_DOCUMENTS_DB_ERROR';
const GET_DOCUMENTS_DB_LOADING = 'GET_DOCUMENTS_DB_LOADING';

const GET_FILTERS_DOCUMENTS_DB_SUCCESS = 'GET_FILTERS_DOCUMENTS_DB_SUCCESS';
const GET_FILTERS_DOCUMENTS_DB_ERROR = 'GET_FILTERS_DOCUMENTS_DB_ERROR';
const GET_FILTERS_DOCUMENTS_DB_LOADING = 'GET_FILTERS_DOCUMENTS_DB_LOADING';
const SET_FILTERS_DOCUMENTS_DB = 'SET_FILTERS_DOCUMENTS_DB';
const SET_ACTIVE_COLUMNS_DOCUMENTS_DB = 'SET_ACTIVE_COLUMNS_DOCUMENTS_DB';

const DOCUMENTS_DB_MAX_SIZE = 3000;

/* Initial state */
const initialState = {
  data: [],
  totalSize: 0,
  loading: false,
  error: false,
  filters: {
    data: {
      forest_types: [],
      type: [],
      status: [],
      country_ids: [],
      operator_id: [],
      fmu_id: [],
      required_operator_document_id: [],
      source: [],
      legal_categories: []
    },
    options: {},
    loading: false,
    error: false,
  },
  columns: ['country', 'document', 'forest-type', 'document-name', 'status', 'operator', 'fmu'],
};

const JSONA = new Jsona();

/* Reducer */
export default function reducer(state = initialState, action) {
  switch (action.type) {
    case GET_DOCUMENTS_DB_SUCCESS:
      return Object.assign({}, state, {
        data: action.payload,
        loading: false,
        error: false,
      });
    case GET_DOCUMENTS_DB_TOTAL_SIZE:
      return Object.assign({}, state, { totalSize: action.payload });
    case GET_DOCUMENTS_DB_ERROR:
      return Object.assign({}, state, { error: true, loading: false });
    case GET_DOCUMENTS_DB_LOADING:
      return Object.assign({}, state, { loading: true, error: false });
    // Filters
    case GET_FILTERS_DOCUMENTS_DB_SUCCESS: {
      const newFilters = Object.assign({}, state.filters, {
        options: action.payload,
        loading: false,
        error: false,
      });
      return Object.assign({}, state, { filters: newFilters });
    }
    case GET_FILTERS_DOCUMENTS_DB_ERROR: {
      const newFilters = Object.assign({}, state.filters, {
        error: true,
        loading: false,
      });
      return Object.assign({}, state, { filters: newFilters });
    }
    case GET_FILTERS_DOCUMENTS_DB_LOADING: {
      const newFilters = Object.assign({}, state.filters, {
        loading: true,
        error: false,
      });
      return Object.assign({}, state, { filters: newFilters });
    }
    case SET_FILTERS_DOCUMENTS_DB: {
      const newFilters = Object.assign({}, state.filters, {
        data: action.payload,
      });
      return Object.assign({}, state, { filters: newFilters });
    }
    case SET_ACTIVE_COLUMNS_DOCUMENTS_DB: {
      return Object.assign({}, state, { columns: action.payload });
    }
    default:
      return state;
  }
}

/* Action creators */
export function getDocumentsDatabase() {
  return (dispatch, getState) => {
    const { language } = getState();
    const filters = getState().database.filters.data;
    const filtersQuery = compact(
      Object.keys(filters).map((key) => {
        if (!isEmpty(filters[key])) {
          return `filter[${key}]=${filters[key].join(',')}`;
        }
        return null;
      })
    );

    const includes = [
      'operator',
      'operator.country',
      'fmu',
      'operator-document-annexes',
      'required-operator-document',
      'required-operator-document.required-operator-document-group',
    ];

    // Fields
    const currentFields = { fmus: ['name,forest-type'], operator: ['name'] };
    const fields = Object.keys(currentFields)
      .map((f) => `fields[${f}]=${currentFields[f]}`)
      .join('&');
    const lang = language === 'zh' ? 'zh-CN' : language;

    const url = `${
      process.env.OTP_API
    }/operator-documents?locale=${lang}&page[size]=${DOCUMENTS_DB_MAX_SIZE}&${fields}&include=${includes.join(
      ','
    )}${filtersQuery.length ? `&${filtersQuery.join('&')}` : ''}`;
    // Waiting for fetch from server -> Dispatch loading
    dispatch({ type: GET_DOCUMENTS_DB_LOADING });

    return fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'OTP-API-KEY': process.env.OTP_API_KEY,
      },
    })
      .then((response) => {
        if (response.ok) return response.json();
        throw new Error(response.statusText);
      })
      .then((documents) => {
        const dataParsed = JSONA.deserialize(documents);

        dispatch({
          type: GET_DOCUMENTS_DB_SUCCESS,
          payload: dataParsed,
        });
      })
      .catch((err) => {
        // Fetch from server ko -> Dispatch error
        dispatch({
          type: GET_DOCUMENTS_DB_ERROR,
          payload: err.message,
        });
      });
  };
}

export function getFilters() {
  return (dispatch, getState) => {
    const { language } = getState();

    // Waiting for fetch from server -> Dispatch loading
    dispatch({ type: GET_FILTERS_DOCUMENTS_DB_LOADING });

    const lang = language === 'zh' ? 'zh-CN' : language;

    return fetch(
      `${process.env.OTP_API}/operator_document_filters_tree?locale=${lang}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'OTP-API-KEY': process.env.OTP_API_KEY,
        },
      }
    )
      .then((response) => {
        if (response.ok) return response.json();
        throw new Error(response.statusText);
      })
      .then((filters) => {
        dispatch({
          type: GET_FILTERS_DOCUMENTS_DB_SUCCESS,
          payload: parseObjectSelectOptions(filters),
        });
      })
      .catch((err) => {
        // Fetch from server ko -> Dispatch error
        dispatch({
          type: GET_FILTERS_DOCUMENTS_DB_ERROR,
          payload: err.message,
        });
      });
  };
}

export function setActiveColumns(activeColumns) {
  return (dispatch) => {
    dispatch({
      type: SET_ACTIVE_COLUMNS_DOCUMENTS_DB,
      payload: activeColumns,
    });
  };
}

export function setFilters(filter) {
  return (dispatch, state) => {
    const newFilters = Object.assign({}, state().database.filters.data);
    const key = Object.keys(filter)[0];
    newFilters[key] = filter[key];

    dispatch({
      type: SET_FILTERS_DOCUMENTS_DB,
      payload: newFilters,
    });
  };
}

export function setDocumentsDatabaseUrl() {
  return (dispatch, getState) => {
    const filters = getState().database.filters.data;
    const query = {};

    Object.keys(filters).forEach((key) => {
      if (filters[key] && filters[key].length) query[key] = filters[key];
    });

    const location = {
      pathname: '/database',
      query: {},
    };

    if (Object.keys(query).length) location.query.filters = encode(query);

    Router.replace(location);
  };
}

export function getDocumentsDatabaseUrl(url) {
  return (dispatch) => {
    const filters = url.query.filters;
    if (filters) {
      const payload = {
        ...decode(url.query.filters),
      };

      dispatch({
        type: SET_FILTERS_DOCUMENTS_DB,
        payload,
      });
    }
  };
}
