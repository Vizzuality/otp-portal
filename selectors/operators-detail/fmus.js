import { createSelector } from 'reselect';

import compact from 'lodash/compact';
import isEmpty from 'lodash/isEmpty';
import flatten from 'lodash/flatten';
import uniqBy from 'lodash/uniqBy';
import sortBy from 'lodash/sortBy';
import slugify from 'slugify';

import { replace } from 'layer-manager';

import { getParams } from '../utils';

const intl = (state, props) => props.intl;

const operatorsDetail = state => state.operatorsDetail.data;

const layersActive = state => state.operatorsDetailFmus.layersActive;
const layers = state => state.operatorsDetailFmus.layers;
const layersSettings = state => state.operatorsDetailFmus.layersSettings;

const interactions = state => state.operatorsDetailFmus.interactions;
const hoverInteractions = state => state.operatorsDetailFmus.hoverInteractions;
const latlng = state => state.operatorsDetailFmus.latlng;
const hoverLatLng = state => state.operatorsDetailFmus.hoverLatLng;

const fmu = state => state.operatorsDetailFmus.fmu;
const fmuBounds = state => state.operatorsDetailFmus.fmuBounds;
const analysis = state => state.operatorsDetailFmus.analysis;

// Create a function to compare the current active datatasets and the current datasetsIds
export const getActiveLayers = createSelector(
  layersActive, layers, layersSettings, interactions, hoverInteractions, fmu, operatorsDetail,
  (_layersActive, _layers, _layersSettings, _interactions, _hoverInteractions, _fmu, _operatorsDetail) => {
    const { id: operator_id, fmus, country } = _operatorsDetail;
    const fmuNames = fmus.map(f => slugify(f.name, { lower: true }));

    // Layers
    const aLayers = _layers.map((l) => {
      const { id, paramsConfig, decodeConfig, decodeFunction, timelineConfig } = l;
      const settings = _layersSettings[id] || {};

      if (_layersActive.includes(id) && _fmu && (!l.iso || l.iso === country.iso)) {
        const interactionParams = { clickId: Number(_fmu) };
        const hoverInteractionParams = _hoverInteractions[id] ? { hoverId: _hoverInteractions[id].data.cartodb_id || _hoverInteractions[id].data.id } : { hoverId: null };

        return {
          id,
          ...l.config,
          ...settings,

          ...(!!paramsConfig) && {
            params: getParams(paramsConfig, { ...settings.params, ...interactionParams, ...hoverInteractionParams, operator_id: Number(operator_id), fmuNames })
          },

          ...(!!decodeConfig) && {
            decodeParams: getParams(decodeConfig, { ...timelineConfig, ...settings.decodeParams, ...settings.timelineParams, operator_id: Number(operator_id), fmuNames }),
            decodeFunction
          }
        };
      }

      return null;
    });

    return compact([
      ...aLayers
    ]);
  }
);

export const getActiveInteractiveLayersIds = createSelector(
  [layers, layersSettings, layersActive, operatorsDetail],
  (_layers, _layersSettings, _layersActive, _operatorsDetail) => {
    if (!_layers) return [];

    const { country } = _operatorsDetail;


    const getIds = (layer) => {
      const { id, config, interactionConfig } = layer;
      if (isEmpty(config) || isEmpty(interactionConfig)) return null;

      const { render = {} } = config;
      const { layers } = render;
      if (!layers) return null;

      return layers.map((l, i) => {
        const {
          id: vectorLayerId,
          type: vectorLayerType
        } = l;

        return vectorLayerId || `${id}-${vectorLayerType}-${i}`;
      });
    };

    return flatten(compact(_layersActive.map((kActive) => {
      const layer = _layers.find(l => l.id === kActive);

      if (!layer || (layer.iso && layer.iso !== country.iso)) {
        return null;
      }

      const { slug, config } = layer;
      const { type } = config;

      if (type === 'group') {
        const { layers: configLayers, default: defaultLayer } = config;
        const current = (_layersSettings[slug] && _layersSettings[slug].current) ?
          _layersSettings[slug].current :
          defaultLayer;

        const layer1 = configLayers.find(l => l.id === current);

        return getIds(layer1);
      }

      return getIds(layer);
    })));
  }
);

export const getActiveInteractiveLayers = createSelector(
  [layers, interactions],
  (_layers, _interactions) => {
    if (!_layers || isEmpty(_interactions)) return {};

    const allLayers = uniqBy(flatten(_layers.map((l) => {
      const { config, name } = l;
      const { type } = config;

      if (type === 'group') {
        return config.layers.map(lc => ({ ...lc, name: `${name} - ${lc.name}` }));
      }

      return l;
    })), 'id');

    const interactiveLayerKeys = Object.keys(_interactions);
    const interactiveLayers = allLayers.filter(l => interactiveLayerKeys.includes(l.id));

    return interactiveLayers.map(l => ({ ...l, data: _interactions[l.id] }));
  }
);

export const getActiveHoverInteractiveLayers = createSelector(
  [layers, hoverInteractions],
  (_layers, _hoverInteractions) => {
    if (!_layers || isEmpty(_hoverInteractions)) return {};

    const allLayers = uniqBy(flatten(_layers.map((l) => {
      const { config, name } = l;
      const { type } = config;

      if (type === 'group') {
        return config.layers.map(lc => ({ ...lc, name: `${name} - ${lc.name}` }));
      }

      return l;
    })), 'id');

    const interactiveLayerKeys = Object.keys(_hoverInteractions);
    const interactiveLayers = allLayers.filter(l => interactiveLayerKeys.includes(l.id));

    return interactiveLayers.map(l => ({ ...l, data: _hoverInteractions[l.id] }));
  }
);


export const getLegendLayers = createSelector(
  [layers, layersSettings, layersActive, analysis, fmu, intl, operatorsDetail], (_layers, _layersSettings, _layersActive, _analysis, _fmu, _intl, _operatorsDetail) => {
    if (!_layers) return [];
    const legendLayers = _layers.filter(l => l.legendConfig && !isEmpty(l.legendConfig));
    const { country } = _operatorsDetail;

    const layerGroups = [];

    _layersActive.forEach((lid) => {
      const layer = legendLayers.find(r => r.id === lid);
      if (!layer || lid === 'fmus' || (layer.iso && layer.iso !== country.iso)) return false;

      const { id, name, description, legendConfig, paramsConfig, sqlConfig, decodeConfig, timelineConfig } = layer;


      const lSettings = _layersSettings[id] || {};

      const params = (!!paramsConfig) && getParams(paramsConfig, lSettings.params);
      const sqlParams = (!!sqlConfig) && getParams(sqlConfig, lSettings.sqlParams);
      const decodeParams = (!!decodeConfig) && getParams(decodeConfig, { ...timelineConfig, ...lSettings.decodeParams });

      const f = _fmu;
      const i = id === 'gain' ? 'loss' : id;
      const analysisParams = {
        loading: _analysis.loading[i],
        error: _analysis.error[i],
        ..._analysis.data[f] && { data: _analysis.data[f][id] }
      };

      layerGroups.push({
        id,
        dataset: id,
        name: _intl.formatMessage({ id: name || '-' }),
        description,
        analysis: analysisParams,
        layers: [{
          ...layer,
          name: _intl.formatMessage({ id: name || '-' }),
          opacity: 1,
          active: true,
          legendConfig: {
            ...legendConfig,
            ...legendConfig.items && {
              items: legendConfig.items.map(i => ({
                ...i,
                ...i.name && { name: _intl.formatMessage({ id: i.name || '-' }) },
                ...i.items && {
                  items: i.items.map(ii => ({
                    ...ii,
                    ...ii.name && { name: _intl.formatMessage({ id: ii.name || '-' }) }
                  }))
                }

              }))
            }
          },
          ...lSettings,
          ...(!!paramsConfig) && {
            params
          },

          ...(!!sqlConfig) && {
            sqlParams
          },

          ...(!!decodeConfig) && {
            decodeParams
          },

          ...!!timelineConfig && {
            timelineParams: {
              ...JSON.parse(replace(JSON.stringify(timelineConfig), { ...params, ...decodeParams })),
              ...getParams(paramsConfig, lSettings.params),
              ...getParams(decodeConfig, lSettings.decodeParams),
              ...lSettings.timelineParams
            }
          }
        }],
        visibility: true,
        ...lSettings
      });
    });

    return layerGroups;
  }
);

export const getPopup = createSelector(
  [latlng],
  (_latlng) => {
    if (isEmpty(_latlng) || !_latlng.lat || !_latlng.lng) {
      return {};
    }

    const popup = {
      latitude: _latlng.lat,
      longitude: _latlng.lng
    };

    return popup;
  }
);

export const getHoverPopup = createSelector(
  [hoverLatLng],
  (_hoverLatLng) => {
    if (isEmpty(_hoverLatLng) || !_hoverLatLng.lat || !_hoverLatLng.lng) {
      return {};
    }

    const popup = {
      latitude: _hoverLatLng.lat,
      longitude: _hoverLatLng.lng
    };

    return popup;
  }
);


export const getFMUs = createSelector(
  operatorsDetail,
  (_operatorsDetail) => {
    const { fmus } = _operatorsDetail;
    return sortBy(fmus, 'name') || [];
  }
);

export const getFMU = createSelector(
  getFMUs, fmu, fmuBounds, layersActive, layers, layersSettings,
  (_fmus, _fmu, _fmuBounds, _layersActive, _layers, _layersSettings) => {
    if (!_fmus.length) {
      return {};
    }

    const analysisLayers = ['loss', 'glad'];

    let FMU;

    if (!_fmu && !!_fmus.length) {
      FMU = _fmus[0];
    } else {
      FMU = _fmus.find(f => Number(f.id) === Number(_fmu));
    }


    return {
      ...FMU,
      bounds: _fmuBounds,
      ...analysisLayers.reduce((acc, key) => {
        const layer = _layers.find(l => l.id === key);
        const { decodeConfig, timelineConfig } = layer;
        const settings = _layersSettings[key] || {};

        return {
          ...acc,
          [key]: {
            ...getParams(decodeConfig, { ...timelineConfig, ...settings.decodeParams })
          }
        };
      }, {})
    };
  }
);
