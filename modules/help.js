import Jsona from 'jsona';
import fetch from 'isomorphic-fetch';

/* Constants */
const GET_HOWTOS_SUCCESS = 'GET_HOWTOS_SUCCESS';
const GET_HOWTOS_ERROR = 'GET_HOWTOS_ERROR';
const GET_HOWTOS_LOADING = 'GET_HOWTOS_LOADING';

const GET_TOOLS_SUCCESS = 'GET_TOOLS_SUCCESS';
const GET_TOOLS_ERROR = 'GET_TOOLS_ERROR';
const GET_TOOLS_LOADING = 'GET_TOOLS_LOADING';

const GET_FAQS_SUCCESS = 'GET_FAQS_SUCCESS';
const GET_FAQS_ERROR = 'GET_FAQS_ERROR';
const GET_FAQS_LOADING = 'GET_FAQS_LOADING';

const GET_TUTORIALS_SUCCESS = 'GET_TUTORIALS_SUCCESS';
const GET_TUTORIALS_ERROR = 'GET_TUTORIALS_ERROR';
const GET_TUTORIALS_LOADING = 'GET_TUTORIALS_LOADING';

const JSONA = new Jsona();

/* Initial state */
const initialState = {
  howtos: {
    data: [],
    loading: false,
    error: false
  },
  tools: {
    data: [],
    loading: false,
    error: false
  },
  faqs: {
    data: [],
    loading: false,
    error: false
  },
  tutorials: {
    data: [],
    loading: false,
    error: false
  }
};

/* Reducer */
export default function (state = initialState, action) {
  switch (action.type) {
    case GET_HOWTOS_SUCCESS: {
      const howtos = Object.assign({}, state.howtos, {
        data: action.payload, loading: false, error: false
      });
      return Object.assign({}, state, { howtos });
    }
    case GET_HOWTOS_ERROR: {
      const howtos = Object.assign({}, state.howtos, {
        error: true, loading: false
      });
      return Object.assign({}, state, { howtos });
    }
    case GET_HOWTOS_LOADING: {
      const howtos = Object.assign({}, state.howtos, {
        loading: true, error: false
      });
      return Object.assign({}, state, { howtos });
    }
    case GET_TOOLS_SUCCESS: {
      const tools = Object.assign({}, state.tools, {
        data: action.payload, loading: false, error: false
      });
      return Object.assign({}, state, { tools });
    }
    case GET_TOOLS_ERROR: {
      const tools = Object.assign({}, state.tools, {
        error: true, loading: false
      });
      return Object.assign({}, state, { tools });
    }
    case GET_TOOLS_LOADING: {
      const tools = Object.assign({}, state.tools, {
        loading: true, error: false
      });
      return Object.assign({}, state, { tools });
    }
    case GET_FAQS_SUCCESS: {
      const faqs = Object.assign({}, state.faqs, {
        data: action.payload, loading: false, error: false
      });
      return Object.assign({}, state, { faqs });
    }
    case GET_FAQS_ERROR: {
      const faqs = Object.assign({}, state.faqs, {
        error: true, loading: false
      });
      return Object.assign({}, state, { faqs });
    }
    case GET_FAQS_LOADING: {
      const faqs = Object.assign({}, state.faqs, {
        loading: true, error: false
      });
      return Object.assign({}, state, { faqs });
    }
    case GET_TUTORIALS_SUCCESS: {
      const tutorials = Object.assign({}, state.tutorials, {
        data: action.payload, loading: false, error: false
      });
      return Object.assign({}, state, { tutorials });
    }
    case GET_TUTORIALS_ERROR: {
      const tutorials = Object.assign({}, state.tutorials, {
        error: true, loading: false
      });
      return Object.assign({}, state, { tutorials });
    }
    case GET_TUTORIALS_LOADING: {
      const tutorials = Object.assign({}, state.tutorials, {
        loading: true, error: false
      });
      return Object.assign({}, state, { tutorials });
    }
    default:
      return state;
  }
}

export function getHowtos() {
  return (dispatch, getState) => {
    const { language } = getState();
    // Waiting for fetch from server -> Dispatch loading
    dispatch({ type: GET_HOWTOS_LOADING });

    const lang = language === 'zh' ? 'zh-CN' : language;

    return fetch(`${process.env.OTP_API}/how-tos?locale=${lang}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/vnd.api+json',
        'OTP-API-KEY': process.env.OTP_API_KEY
      }
    })
      .then((response) => {
        if (response.ok) return response.json();
        throw new Error(response.statusText);
      })
      .then((tutorials) => {
        const dataParsed = JSONA.deserialize(tutorials);

        dispatch({
          type: GET_HOWTOS_SUCCESS,
          payload: dataParsed
        });
      })
      .catch((err) => {
        console.error(err);
        // Fetch from server ko -> Dispatch error
        dispatch({
          type: GET_HOWTOS_ERROR,
          payload: err.message
        });
      });
  };
}

export function getTools() {
  return (dispatch, getState) => {
    const { language } = getState();
    // Waiting for fetch from server -> Dispatch loading
    dispatch({ type: GET_TOOLS_LOADING });

    const lang = language === 'zh' ? 'zh-CN' : language;

    return fetch(`${process.env.OTP_API}/tools?locale=${lang}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/vnd.api+json',
        'OTP-API-KEY': process.env.OTP_API_KEY
      }
    })
      .then((response) => {
        if (response.ok) return response.json();
        throw new Error(response.statusText);
      })
      .then((tutorials) => {
        const dataParsed = JSONA.deserialize(tutorials);

        dispatch({
          type: GET_TOOLS_SUCCESS,
          payload: dataParsed
        });
      })
      .catch((err) => {
        console.error(err);
        // Fetch from server ko -> Dispatch error
        dispatch({
          type: GET_TOOLS_ERROR,
          payload: err.message
        });
      });
  };
}


export function getFAQs() {
  return (dispatch, getState) => {
    const { language } = getState();
    // Waiting for fetch from server -> Dispatch loading
    dispatch({ type: GET_FAQS_LOADING });

    const lang = language === 'zh' ? 'zh-CN' : language;

    return fetch(`${process.env.OTP_API}/faqs?locale=${lang}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/vnd.api+json',
        'OTP-API-KEY': process.env.OTP_API_KEY
      }
    })
      .then((response) => {
        if (response.ok) return response.json();
        throw new Error(response.statusText);
      })
      .then((faqs) => {
        const dataParsed = JSONA.deserialize(faqs);

        dispatch({
          type: GET_FAQS_SUCCESS,
          payload: dataParsed
        });
      })
      .catch((err) => {
        console.error(err);
        // Fetch from server ko -> Dispatch error
        dispatch({
          type: GET_FAQS_ERROR,
          payload: err.message
        });
      });
  };
}


export function getTutorials() {
  return (dispatch, getState) => {
    const { language } = getState();
    // Waiting for fetch from server -> Dispatch loading
    dispatch({ type: GET_TUTORIALS_LOADING });

    const lang = language === 'zh' ? 'zh-CN' : language;

    return fetch(`${process.env.OTP_API}/tutorials?locale=${lang}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/vnd.api+json',
        'OTP-API-KEY': process.env.OTP_API_KEY
      }
    })
      .then((response) => {
        if (response.ok) return response.json();
        throw new Error(response.statusText);
      })
      .then((tutorials) => {
        const dataParsed = JSONA.deserialize(tutorials);

        dispatch({
          type: GET_TUTORIALS_SUCCESS,
          payload: dataParsed
        });
      })
      .catch((err) => {
        console.error(err);
        // Fetch from server ko -> Dispatch error
        dispatch({
          type: GET_TUTORIALS_ERROR,
          payload: err.message
        });
      });
  };
}
