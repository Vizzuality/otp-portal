import fetch from 'isomorphic-fetch';

const SAWMILL_MAP_LOCATION = 'SAWMILL_MAP_LOCATION';
const SAWMILL_UNMOUNT_MAP = 'SAWMILL_UNMOUNT_MAP';

const GET_SAWMILL_LOCATION_SUCCESS = 'GET_SAWMILL_LOCATION_SUCCESS';
const GET_SAWMILL_LOCATION_LOADING = 'GET_SAWMILL_LOCATION_LOADING';
const GET_SAWMILL_LOCATION_ERROR = 'GET_SAWMILL_LOCATION_ERROR';

const initialState = {
  viewport: { // TODO : transfer zoom and center
    zoom: 5,
    latitude: 0,
    longitude: 18
  },
  loading: false,
  error: false,
  sawmill: {}
};

/* Reducer */
export default function (state = initialState, action) {
  switch (action.type) {
    case SAWMILL_MAP_LOCATION: {
      return Object.assign({}, state, { viewport: { ...state.viewport, ...action.payload } });
    }

    case SAWMILL_UNMOUNT_MAP: {
      return Object.assign({}, state, { ...initialState });
    }

    case GET_SAWMILL_LOCATION_SUCCESS: {
      return Object.assign({}, state, {
        sawmill: action.payload,
        loading: false,
        error: false
      });
    }

    case GET_SAWMILL_LOCATION_LOADING: {
      return Object.assign({}, state, {
        loading: true,
        error: false
      });
    }

    case GET_SAWMILL_LOCATION_ERROR: {
      return Object.assign({}, state, {
        error: true,
        loading: false
      });
    }

    default:
      return state;
  }
}

export function setMapLocation(mapLocation) {
  return {
    type: SAWMILL_MAP_LOCATION,
    payload: mapLocation
  };
}

export function getSawMillLocationById(id) {
  return (dispatch) => {
    // Waiting for fetch from server -> Dispatch loading
    dispatch({ type: GET_SAWMILL_LOCATION_LOADING });

    return fetch(`${process.env.OTP_API}/sawmills/${id}`, {
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
      .then((data) => {
        // Fetch from server ok -> Dispatch geojson sawmill data
        dispatch({
          type: GET_SAWMILL_LOCATION_SUCCESS,
          payload: data
        });
      })
      .catch((err) => {
        // Fetch from server ko -> Dispatch error
        dispatch({
          type: GET_SAWMILL_LOCATION_ERROR,
          payload: err.message
        });
      });
  };
}

export function unmountMap() {
  return (dispatch) => {
    dispatch({
      type: SAWMILL_UNMOUNT_MAP
    });
  };
}
