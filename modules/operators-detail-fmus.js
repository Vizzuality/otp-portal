import { LAYERS } from 'constants/layers';

const GET_FMU_ANALYSIS_SUCCESS = 'GET_FMU_ANALYSIS_SUCCESS';
const GET_FMU_ANALYSIS_LOADING = 'GET_FMU_ANALYSIS_LOADING';
const GET_FMU_ANALYSIS_ERROR = 'GET_FMU_ANALYSIS_ERROR';

const SET_OPERATORS_DETAIL_FMU_SELECTED = 'SET_OPERATORS_DETAIL_FMU_SELECTED';
const SET_OPERATORS_DETAIL_FMU_BOUNDS = 'SET_OPERATORS_DETAIL_FMU_BOUNDS';

const SET_OPERATORS_DETAIL_MAP_LOCATION = 'SET_OPERATORS_DETAIL_MAP_LOCATION';
const SET_OPERATORS_DETAIL_MAP_INTERACTIONS = 'SET_OPERATORS_DETAIL_MAP_INTERACTIONS';
const SET_OPERATORS_DETAIL_MAP_HOVER_INTERACTIONS = 'SET_OPERATORS_DETAIL_MAP_HOVER_INTERACTIONS';
const SET_OPERATORS_DETAIL_MAP_LAYERS_SETTINGS = 'SET_OPERATORS_DETAIL_MAP_LAYERS_SETTINGS';

/* Initial state */
const initialState = {
  map: {
    zoom: 5,
    latitude: 0,
    longitude: 20,
    scrollZoom: false
  },

  latlng: {},
  hoverLatLng: {},

  interactions: {},

  hoverInteractions: {},

  layers: LAYERS,
  layersActive: [
    'gain',
    'loss',
    'glad',
    'aac-cog',
    'aac-cod',
    // 'aac-cmr',
    'fmusdetail'
  ],
  layersSettings: {},

  fmu: undefined,
  fmusBounds: undefined,
  analysis: {
    data: {},
    loading: false,
    error: false
  }
};

/* Reducer */
export default function (state = initialState, action) {
  switch (action.type) {
    case GET_FMU_ANALYSIS_SUCCESS: {
      const analysis = {
        data: { ...state.analysis.data, ...action.payload.data },
        loading: {
          ...state.analysis.loading,
          [action.payload.type]: false
        },
        error: {
          ...state.analysis.error,
          [action.payload.type]: false
        }
      };
      return Object.assign({}, state, { analysis });
    }
    case GET_FMU_ANALYSIS_ERROR: {
      const analysis = {
        ...state.analysis,
        loading: {
          ...state.analysis.loading,
          [action.payload.type]: false
        },
        error: {
          ...state.analysis.error,
          [action.payload.type]: true
        }
      };
      return Object.assign({}, state, { analysis });
    }
    case GET_FMU_ANALYSIS_LOADING: {
      const analysis = {
        ...state.analysis,
        loading: {
          ...state.analysis.loading,
          [action.payload.type]: true
        },
        error: {
          ...state.analysis.error,
          [action.payload.type]: false
        }
      };
      return Object.assign({}, state, { analysis });
    }
    case SET_OPERATORS_DETAIL_MAP_LOCATION: {
      const map = Object.assign({}, state.map, action.payload);
      return Object.assign({}, state, { map });
    }

    case SET_OPERATORS_DETAIL_FMU_SELECTED: {
      return Object.assign({}, state, { fmu: action.payload });
    }

    case SET_OPERATORS_DETAIL_FMU_BOUNDS: {
      return Object.assign({}, state, { fmuBounds: action.payload });
    }

    case SET_OPERATORS_DETAIL_MAP_INTERACTIONS: {
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
    case SET_OPERATORS_DETAIL_MAP_HOVER_INTERACTIONS: {
      const { features = [], lngLat = [] } = action.payload;
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
        hoverLatLng: {
          lat: lngLat[1],
          lng: lngLat[0]
        },
        hoverInteractions
      };
    }
    case SET_OPERATORS_DETAIL_MAP_LAYERS_SETTINGS: {
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
    default:
      return state;
  }
}

// SETTERS
// - setMapLocation
// - setFmuSelected
// - setAnalysis
export function setOperatorsDetailMapLocation(mapLocation) {
  return {
    type: SET_OPERATORS_DETAIL_MAP_LOCATION,
    payload: mapLocation
  };
}

export function setOperatorsDetailFmu(fmu) {
  return {
    type: SET_OPERATORS_DETAIL_FMU_SELECTED,
    payload: fmu
  };
}

export function setOperatorsDetailFmuBounds(payload) {
  return {
    type: SET_OPERATORS_DETAIL_FMU_BOUNDS,
    payload
  };
}


function fetchAnalysis(dispatch, getState, data, fmu, type) {
  dispatch({ type: GET_FMU_ANALYSIS_LOADING, payload: { type } });

  const requestEndpoints = {
    loss: 'umd-loss-gain',
    glad: 'glad-alerts'
  };

  const { startDate, trimEndDate } = fmu[type];

  const queryparams = {
    geostore: data.id,
    period: `${startDate},${trimEndDate}`
  };

  return fetch(`${process.env.RW_API}/${requestEndpoints[type]}?${Object.keys(queryparams).map(q => `${q}=${queryparams[q]}`).join('&')}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  })
    .then((response) => {
      if (response.ok) return response.json();
    })
    .then((response) => {
      const { operatorsDetailFmus } = getState();
      const { analysis } = operatorsDetailFmus;
      const { data: analysisData } = analysis;

      dispatch({
        type: GET_FMU_ANALYSIS_SUCCESS,
        payload: {
          type,
          data: {
            [fmu.id]: {
              geostore: data.id,
              ...analysisData[fmu.id],
              ...(type === 'loss') && {
                gain: response && response.data && response.data.attributes,
                loss: response && response.data && response.data.attributes
              },
              ...(type === 'glad') && {
                glad: response && response.data && response.data.attributes
              }
            }
          }
        }
      });
    })
    .catch(error => dispatch({ type: GET_FMU_ANALYSIS_ERROR, payload: { type } }));
}

// GEOSTORE
export function setOperatorsDetailAnalysis(fmu, type) {
  return (dispatch, getState) => {
    const { operatorsDetailFmus } = getState();
    const { analysis } = operatorsDetailFmus;
    const { data: analysisData } = analysis;

    if (!fmu.geojson) {
      return null;
    }

    if (analysisData && analysisData[fmu.id] && analysisData[fmu.id].geostore) {
      return fetchAnalysis(dispatch, getState, { id: analysisData[fmu.id].geostore }, fmu, type);
    }

    // Waiting for fetch from server -> Dispatch loading
    dispatch({ type: GET_FMU_ANALYSIS_LOADING, payload: { type } });

    fetch(`${process.env.RW_API}/geostore`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ geojson: fmu.geojson })
    })
    .then((response) => {
      if (response.ok) return response.json();
      throw new Error(response.statusText);
    })
    .then(({ data }) => {
      return fetchAnalysis(dispatch, getState, data, fmu, type);
    })
    .catch(error => dispatch({ type: GET_FMU_ANALYSIS_ERROR, payload: { type } }));
  };
}

export function setOperatorsDetailMapLayersSettings(payload) {
  return {
    type: SET_OPERATORS_DETAIL_MAP_LAYERS_SETTINGS,
    payload
  };
}

export function setOperatorsDetailMapInteractions(payload) {
  return {
    type: SET_OPERATORS_DETAIL_MAP_INTERACTIONS,
    payload
  };
}

export function setOperatorsDetailMapHoverInteractions(payload) {
  return {
    type: SET_OPERATORS_DETAIL_MAP_HOVER_INTERACTIONS,
    payload
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
          type: SET_OPERATORS_DETAIL_MAP_LAYERS_SETTINGS,
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
          type: SET_OPERATORS_DETAIL_MAP_LAYERS_SETTINGS,
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


