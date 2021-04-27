import Jsona from 'jsona';
import fetch from 'isomorphic-fetch';
import * as queryString from 'query-string';

/* Constants */
const GET_OPERATOR_SUCCESS = 'GET_OPERATOR_SUCCESS';
const GET_OPERATOR_ERROR = 'GET_OPERATOR_ERROR';
const GET_OPERATOR_LOADING = 'GET_OPERATOR_LOADING';

const GET_OPERATOR_DOCUMENTATION_SUCCESS = 'GET_OPERATOR_DOCUMENTATION_SUCCESS';
const GET_OPERATOR_DOCUMENTATION_ERROR = 'GET_OPERATOR_DOCUMENTATION_ERROR';
const GET_OPERATOR_DOCUMENTATION_LOADING = 'GET_OPERATOR_DOCUMENTATION_LOADING';

const GET_OPERATOR_TIMELINE_SUCCESS = 'GET_OPERATOR_TIMELINE_SUCCESS';
const GET_OPERATOR_TIMELINE_ERROR = 'GET_OPERATOR_TIMELINE_ERROR';
const GET_OPERATOR_TIMELINE_LOADING = 'GET_OPERATOR_TIMELINE_LOADING';

const SET_OPERATOR_DOCUMENTATION_DATE = 'SET_OPERATOR_DOCUMENTATION_DATE';
const SET_OPERATOR_DOCUMENTATION_FMU = 'SET_OPERATOR_DOCUMENTATION_FMU';

/* Constants sawmills */
const GET_SAWMILLS_SUCCESS = 'GET_SAWMILLS_SUCCESS';
const GET_SAWMILLS_ERROR = 'GET_SAWMILLS_ERROR';
const GET_SAWMILLS_LOADING = 'GET_SAWMILLS_LOADING';

const GET_SAWMILLS_LOCATIONS_SUCCESS = 'GET_SAWMILLS_LOCATION_SUCCESS';
const GET_SAWMILLS_LOCATIONS_LOADING = 'GET_SAWMILLS_LOCATION_LOADING';
const GET_SAWMILLS_LOCATIONS_ERROR = 'GET_SAWMILLS_LOCATION_ERROR';

/* Initial state */
const initialState = {
  data: {},
  loading: false,
  error: false,
  documentation: {
    data: [],
    loading: false,
    error: false,
  },
  date: new Date(),
  FMU: null,
  timeline: [],
  sawmills: {
    data: [],
    loading: false,
    error: false,
  },
  sawmillsLocations: {
    data: [],
    loading: false,
    error: false,
  },
};

const JSONA = new Jsona();

/* Reducer */
export default function (state = initialState, action) {
  switch (action.type) {
    case GET_OPERATOR_SUCCESS: {
      return Object.assign({}, state, {
        data: action.payload,
        loading: false,
        error: false,
      });
    }
    case GET_OPERATOR_ERROR: {
      return Object.assign({}, state, { error: true, loading: false });
    }
    case GET_OPERATOR_LOADING: {
      return Object.assign({}, state, { loading: true, error: false });
    }
    case SET_OPERATOR_DOCUMENTATION_DATE: {
      const documentation = Object.assign({}, state, {
        date: action.payload,
      });
      return Object.assign({}, state, documentation);
    }
    case SET_OPERATOR_DOCUMENTATION_FMU: {
      const documentation = Object.assign({}, state, {
        fmu: action.payload,
      });
      return Object.assign({}, state, documentation);
    }
    case GET_OPERATOR_TIMELINE_SUCCESS: {
      return Object.assign({}, state, {
        timeline: action.payload,
        loading: false,
        error: false,
      });
    }
    case GET_OPERATOR_TIMELINE_ERROR: {
      return Object.assign({}, state, { error: true, loading: false });
    }
    case GET_OPERATOR_TIMELINE_LOADING: {
      return Object.assign({}, state, { loading: true, error: false });
    }
    case GET_OPERATOR_DOCUMENTATION_SUCCESS: {
      const documentation = Object.assign({}, state.documentation, {
        data: action.payload,
        loading: false,
        error: false,
      });
      return Object.assign({}, state, { documentation });
    }
    case GET_OPERATOR_DOCUMENTATION_ERROR: {
      const documentation = Object.assign({}, state.documentation, {
        error: true,
        loading: false,
      });
      return Object.assign({}, state, { documentation });
    }
    case GET_OPERATOR_DOCUMENTATION_LOADING: {
      const documentation = Object.assign({}, state.documentation, {
        loading: true,
        error: false,
      });
      return Object.assign({}, state, { documentation });
    }
    case GET_SAWMILLS_SUCCESS: {
      const sawmills = Object.assign({}, state.sawmills, {
        data: action.payload,
        loading: false,
        error: false,
      });
      return Object.assign({}, state, { sawmills });
    }
    case GET_SAWMILLS_ERROR: {
      const sawmills = Object.assign({}, state.sawmills, {
        error: true,
        loading: false,
      });
      return Object.assign({}, state, { sawmills });
    }
    case GET_SAWMILLS_LOADING: {
      const sawmills = Object.assign({}, state.sawmills, {
        loading: true,
        error: false,
      });
      return Object.assign({}, state, { sawmills });
    }

    // Get all sawmills geojson by Operator ID
    case GET_SAWMILLS_LOCATIONS_SUCCESS: {
      const sawmillsLocations = Object.assign({}, state.sawmillsLocations, {
        data: action.payload.features,
        loading: false,
        error: false,
      });
      return Object.assign({}, state, { sawmillsLocations });
    }
    case GET_SAWMILLS_LOCATIONS_LOADING: {
      const sawmillsLocations = Object.assign({}, state.sawmillsLocations, {
        loading: true,
        error: false,
      });
      return Object.assign({}, state, { sawmillsLocations });
    }
    case GET_SAWMILLS_LOCATIONS_ERROR: {
      const sawmillsLocations = Object.assign({}, state.sawmillsLocations, {
        error: true,
        loading: false,
      });
      return Object.assign({}, state, { sawmillsLocations });
    }

    default:
      return state;
  }
}

/* Action creators */
export function getOperator(id) {
  return (dispatch, getState) => {
    const { user, language } = getState();
    // Waiting for fetch from server -> Dispatch loading
    dispatch({ type: GET_OPERATOR_LOADING });

    const includeFields = [
      'country',
      'observations',
      'observations.severity',
      'observations.subcategory',
      'observations.subcategory.category',
      'observations.observation-report',
      'observations.observation-documents',
      'observations.country',
      'observations.fmu',
      'observations.observers',
      'observations.relevant-operators',
      'fmus',
    ];

    const lang = language === 'zh' ? 'zh-CN' : language;

    const queryParams = queryString.stringify({
      include: includeFields.join(','),
      locale: lang,
    });

    return fetch(`${process.env.OTP_API}/operators/${id}?${queryParams}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'OTP-API-KEY': process.env.OTP_API_KEY,
        Authorization: user.token ? `Bearer ${user.token}` : undefined,
      },
    })
      .then((response) => {
        if (response.ok) return response.json();
        throw new Error(response.statusText);
      })
      .then((operator) => {
        // Fetch from server ok -> Dispatch operator and deserialize the data
        const dataParsed = JSONA.deserialize(operator);

        dispatch({
          type: GET_OPERATOR_SUCCESS,
          payload: dataParsed,
        });
      })
      .catch((err) => {
        // Fetch from server ko -> Dispatch error
        dispatch({
          type: GET_OPERATOR_ERROR,
          payload: err.message,
        });
      });
  };
}

export function getOperatorDocumentation(id) {
  return (dispatch, getState) => {
    const { user, language, operatorsDetail } = getState();
    const date = operatorsDetail.date;
    dispatch({ type: GET_OPERATOR_DOCUMENTATION_LOADING });

    const includeFields = [
      'required-operator-document',
      'required-operator-document.required-operator-document-group',
      'operator-document-annexes',
      'fmu',
    ];
    const lang = language === 'zh' ? 'zh-CN' : language;
    const queryParams = queryString.stringify({
      include: includeFields.join(','),
      'filter[operator-id]': id,
      'filter[date]': date,
      locale: lang,
    });

    return fetch(
      `${process.env.OTP_API}/operator-document-histories?${queryParams}`,
      // /operator-document-histories?include=required-operator-document&filter[operator-id]=161&filter[date]=2017-10-10
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'OTP-API-KEY': process.env.OTP_API_KEY,
          Authorization: user.token ? `Bearer ${user.token}` : undefined,
        },
      }
    )
      .then((response) => {
        if (response.ok) return response.json();
        throw new Error(response.statusText);
      })
      .then((operator) => {
        const dataParsed = JSONA.deserialize(operator);

        dispatch({
          type: GET_OPERATOR_DOCUMENTATION_SUCCESS,
          payload: dataParsed,
        });
      })
      .catch((err) => {
        dispatch({
          type: GET_OPERATOR_DOCUMENTATION_ERROR,
          payload: err.message,
        });
      });
  };
}

export function getOperatorTimeline(id) {
  return (dispatch, getState) => {
    const { user, language } = getState();
    dispatch({ type: GET_OPERATOR_TIMELINE_LOADING });

    const lang = language === 'zh' ? 'zh-CN' : language;
    const queryParams = queryString.stringify({
      'filter[operator]': id,
      locale: lang,
    });

    return fetch(
      `${process.env.OTP_API}/score-operator-documents?${queryParams}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'OTP-API-KEY': process.env.OTP_API_KEY,
          Authorization: user.token ? `Bearer ${user.token}` : undefined,
        },
      }
    )
      .then((response) => {
        if (response.ok) return response.json();
        throw new Error(response.statusText);
      })
      .then((operator) => {
        // Fetch from server ok -> Dispatch operator and deserialize the data
        const dataParsed = JSONA.deserialize(operator);

        dispatch({
          type: GET_OPERATOR_TIMELINE_SUCCESS,
          payload: dataParsed,
        });
      })
      .catch((err) => {
        // Fetch from server ko -> Dispatch error
        dispatch({
          type: GET_OPERATOR_TIMELINE_ERROR,
          payload: err.message,
        });
      });
  };
}

/* Action creators */
export function getSawMillsByOperatorId(id) {
  return (dispatch) => {
    // Waiting for fetch from server -> Dispatch loading
    dispatch({ type: GET_SAWMILLS_LOADING });

    return fetch(`${process.env.OTP_API}/sawmills?filter[operator]=${id}`, {
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
      .then((data) => {
        // Fetch from server ok -> Dispatch geojson sawmill data
        const dataParsed = JSONA.deserialize(data);

        dispatch({
          type: GET_SAWMILLS_SUCCESS,
          payload: dataParsed,
        });
      })
      .catch((err) => {
        // Fetch from server ko -> Dispatch error
        dispatch({
          type: GET_SAWMILLS_ERROR,
          payload: err.message,
        });
      });
  };
}

export function getSawMillsLocationByOperatorId(id) {
  return (dispatch) => {
    // Waiting for fetch from server -> Dispatch loading
    dispatch({ type: GET_SAWMILLS_LOCATIONS_LOADING });

    return fetch(
      `${process.env.OTP_API}/sawmills?filter[operator]=${id}&format=geojson`,
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
      .then((data) => {
        // Fetch from server ok -> Dispatch geojson sawmill data
        dispatch({
          type: GET_SAWMILLS_LOCATIONS_SUCCESS,
          payload: data,
        });
      })
      .catch((err) => {
        // Fetch from server ko -> Dispatch error
        dispatch({
          type: GET_SAWMILLS_LOCATIONS_ERROR,
          payload: err.message,
        });
      });
  };
}

export function setOperatorDocumentationDate(date) {
  return (dispatch) => {
    dispatch({
      type: SET_OPERATOR_DOCUMENTATION_DATE,
      payload: date,
    });
  };
}

export function setOperatorDocumentationFMU(date) {
  return (dispatch) => {
    dispatch({
      type: SET_OPERATOR_DOCUMENTATION_FMU,
      payload: date,
    });
  };
}
