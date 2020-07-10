import React from 'react';
import { createSelector } from 'reselect';

import compact from 'lodash/compact';
import isEmpty from 'lodash/isEmpty';
import flatten from 'lodash/flatten';
import uniqBy from 'lodash/uniqBy';
import sortBy from 'lodash/sortBy';

import { replace } from 'layer-manager';

import Fuse from 'fuse.js';

// Utils
import { getParams } from '../utils';
import { HELPERS_DOC } from 'utils/documentation';
import { SEARCH_OPTIONS } from 'constants/general';

import OperatorsCertificationsTd from 'components/operators/certificationsTd';
import OperatorsObservationsTd from 'components/operators/observationsTd';


const intl = (state, props) => props.intl;

const data = state => state.operatorsRanking.data;
const filters = state => state.operatorsRanking.filters;

const layersActive = state => state.operatorsRanking.layersActive;
const layers = state => state.operatorsRanking.layers;
const layersSettings = state => state.operatorsRanking.layersSettings;

const interactions = state => state.operatorsRanking.interactions;
const hoverInteractions = state => state.operatorsRanking.hoverInteractions;
const latlng = state => state.operatorsRanking.latlng;

const countryOptions = state => state.operatorsRanking.filters.options.country;
const countryActive = state => state.operatorsRanking.filters.data.country;


// Create a function to compare the current active datatasets and the current datasetsIds
export const getActiveLayers = createSelector(
  layersActive, layers, layersSettings, interactions, hoverInteractions, countryOptions, countryActive,
  (_layersActive, _layers, _layersSettings, _interactions, _hoverInteractions, _countryOptions, _countryActive) => {
    const cIsoCodes = compact(_countryOptions.map((c) => {
      if (!_countryActive || !_countryActive.length) {
        return c.iso;
      }

      if (_countryActive.includes(c.value)) {
        return c.iso;
      }
      return null;
    }));

    // Country layers
    const cLayers = _countryOptions.map((c) => {
      let opacity = 1;

      if (_countryActive && _countryActive.length) {
        opacity = Number(_countryActive.includes(c.value));
      }


      return {
        id: c.iso,
        type: 'geojson',
        opacity,
        source: {
          type: 'geojson',
          provider: {
            type: 'countries',
            url: `https://api.resourcewatch.org/v2/geostore/admin/${c.iso}?simplify=0.0000001`
          }
        },
        render: {
          layers: [{
            type: 'line',
            paint: {
              'line-color': '#333333',
              'line-width': 2,
              'line-opacity': 0.8
            }
          }]
        }
      };
    });

    // Layers
    const aLayers = _layers.map((l) => {
      const { id, paramsConfig, decodeConfig, decodeFunction, timelineConfig } = l;
      const settings = _layersSettings[id] || {};
      const hoverInteractionParams = _hoverInteractions[id] ? { hoverId: _hoverInteractions[id].data.cartodb_id || _hoverInteractions[id].data.id } : {};

      if (_layersActive.includes(id)) {
        return {
          id,
          ...l.config,
          ...settings,

          ...(!!paramsConfig) && {
            params: getParams(paramsConfig, { ...settings.params, ...hoverInteractionParams, country_iso_codes: cIsoCodes })
          },

          ...(!!decodeConfig) && {
            decodeParams: getParams(decodeConfig, { ...timelineConfig, ...settings.decodeParams, ...settings.timelineParams }),
            decodeFunction
          }
        };
      }

      return null;
    });

    return compact([
      ...cLayers,
      ...aLayers
    ]);
  }
);

export const getActiveInteractiveLayersIds = createSelector(
  [layers, layersSettings, layersActive],
  (_layers, _layersSettings, _layersActive) => {
    if (!_layers) return [];

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

      if (!layer) {
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

export const getLegendLayers = createSelector(
  [layers, layersSettings, layersActive, intl], (_layers, _layersSettings, _layersActive, _intl) => {
    if (!_layers) return [];
    const legendLayers = _layers.filter(l => l.legendConfig && !isEmpty(l.legendConfig));

    const layerGroups = [];

    _layersActive.forEach((lid) => {
      const layer = legendLayers.find(r => r.id === lid);
      if (!layer) return false;

      const { id, name, description, legendConfig, paramsConfig, sqlConfig, decodeConfig, timelineConfig } = layer;

      const lSettings = _layersSettings[id] || {};

      const params = (!!paramsConfig) && getParams(paramsConfig, lSettings.params);
      const sqlParams = (!!sqlConfig) && getParams(sqlConfig, lSettings.sqlParams);
      const decodeParams = (!!decodeConfig) && getParams(decodeConfig, { ...timelineConfig, ...lSettings.decodeParams });

      layerGroups.push({
        id,
        dataset: id,
        name: _intl.formatMessage({ id: name || '-' }),
        description,
        layers: [{
          ...layer,
          name: _intl.formatMessage({ id: name || '-' }),
          opacity: 1,
          active: true,
          legendConfig: {
            ...legendConfig,
            ...legendConfig.items && {
              items: sortBy(legendConfig.items.map(i => ({
                ...i,
                ...i.name && { name: _intl.formatMessage({ id: i.name || '-' }) },
                ...i.items && {
                  items: i.items.map(ii => ({
                    ...ii,
                    ...ii.name && { name: _intl.formatMessage({ id: ii.name || '-' }) }
                  }))
                }

              })), 'name')
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

export const getTable = createSelector(
  [data, filters],
  (_data, _filters) => {
    const activeCountries = _filters.data.country.length ? _filters.data.country : null;
    const activeCertifications = _filters.data.certification.length ? _filters.data.certification : null;
    const activeSearch = _filters.data.operator.length ? _filters.data.operator : null;

    let operatorsTable = null;

    // Filter by country
    if (activeCountries) {
      operatorsTable = (operatorsTable || _data).filter(o => {
        return activeCountries.indexOf(Number(o.country.id)) !== -1;
      });
    }

    // Filter by certification
    if (activeCertifications) {
      operatorsTable = (operatorsTable || _data).filter(o => {
        return o.fmus.some(f => {
          return activeCertifications.some(ac => {
            return f[`certification-${ac}`];
          });
        });
      });
    }

    if (activeSearch) {
      const fuse = new Fuse(operatorsTable || _data, SEARCH_OPTIONS);
      operatorsTable = fuse.search(activeSearch);
    }

    operatorsTable = (operatorsTable || _data).map(o => ({
      id: o.id,
      name: o.name,
      certification: <OperatorsCertificationsTd fmus={o.fmus} />,
      ranking: o.ranking,
      score: o.score || 0,
      observations: <OperatorsObservationsTd name={o.name} fmus={o.fmus} obs_per_visit={o['obs-per-visit']} observations={o.observations} />,
      documentation: HELPERS_DOC.getPercentage(o),
      fmus: o.fmus,
      fmusLenght: o.fmus ? o.fmus.length : 0,
      country: o.country.name
    }));



    // Filter by producer name



    return operatorsTable;
  }
);
