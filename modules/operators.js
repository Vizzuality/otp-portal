import Jsona from 'jsona';
import fetch from 'isomorphic-fetch';

/* Constants */
const GET_OPERATORS_SUCCESS = 'GET_OPERATORS_SUCCESS';
const GET_OPERATORS_ERROR = 'GET_OPERATORS_ERROR';
const GET_OPERATORS_LOADING = 'GET_OPERATORS_LOADING';

const SET_ACTIVE_MAP_LAYERS = 'SET_ACTIVE_MAP_LAYERS';

const JSONA = new Jsona();

/* Initial state */
const initialState = {
  data: [],
  loading: false,
  error: false,
};

/* Reducer */
export default function Operators(state = initialState, action) {
  switch (action.type) {
    case GET_OPERATORS_SUCCESS:
      return Object.assign({}, state, {
        data: action.payload,
        loading: false,
        error: false,
      });
    case GET_OPERATORS_ERROR:
      return Object.assign({}, state, { error: true, loading: false });
    case GET_OPERATORS_LOADING:
      return Object.assign({}, state, { loading: true, error: false });
    case SET_ACTIVE_MAP_LAYERS:
      return Object.assign({}, state, {
        map: { activeLayers: action.payload },
      });
    default:
      return state;
  }
}

export function getOperators() {
  return (dispatch, getState) => {
    const { language } = getState();
    // Waiting for fetch from server -> Dispatch loading
    dispatch({ type: GET_OPERATORS_LOADING });

    const lang = language === 'zh' ? 'zh-CN' : language;

    return fetch(
      `${
        process.env.OTP_API
      }/operators?locale=${lang}&page[size]=2000&filter[country]=${process.env.OTP_COUNTRIES_IDS.join(
        ','
      )}&filter[fa]=true`,
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
      .then((operators) => {
        const dataParsed = JSONA.deserialize(operators);

        dispatch({
          type: GET_OPERATORS_SUCCESS,
          payload: dataParsed,
        });
      })
      .catch((err) => {
        console.error(err);
        // Fetch from server ko -> Dispatch error
        dispatch({
          type: GET_OPERATORS_ERROR,
          payload: err.message,
        });
      });
  };
}
