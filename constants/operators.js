import { render } from 'react-dom';
import Popup from 'components/map/popup';
import * as Cookies from 'js-cookie';

const MAP_LAYERS_OPERATORS = [
  {
    id: 'glad',
    provider: 'raster',
    source: {
      type: 'raster',
      tiles: [
        '/glad-layer/{z}/{x}/{y}'
      ],
      tileSize: 256
    },
    layers: [{
      id: 'glad_layer',
      name: 'GLAD alerts layer',
      type: 'raster',
      source: 'glad',
      minzoom: 0,
      legendConfig: {
        type: 'basic',
        toggle: { layerId: 'glad' },
        color: '#FF6699',
        items: [
          { name: 'GLAD alerts (1 January 2015 - today)', color: '#FF6699' }
        ]
      },
      paint: {
        'raster-opacity': 1,
        'raster-hue-rotate': 0,
        'raster-brightness-min': 0,
        'raster-brightness-max': 1,
        'raster-saturation': 0,
        'raster-contrast': 0
      }
    }]
  },
  // RASTER LAYERS (LOSS & GAIN)
  {
    id: 'loss',
    provider: 'raster',
    source: {
      type: 'raster',
      tiles: [
        '/loss-layer/{z}/{x}/{y}'
      ],
      tileSize: 256
    },
    layers: [{
      id: 'loss_layer',
      name: 'Tree cover loss',
      type: 'raster',
      source: 'loss',
      minzoom: 0,
      legendConfig: {
        type: 'basic',
        toggle: { layerId: 'loss' },
        color: '#FF6699',
        items: [
          { name: 'Tree cover loss', color: '#FF6699' }
        ]
      },
      paint: {
        'raster-opacity': 1,
        'raster-hue-rotate': 0,
        'raster-brightness-min': 0,
        'raster-brightness-max': 1,
        'raster-saturation': 0,
        'raster-contrast': 0
      }
    }]
  },
  {
    id: 'gain',
    provider: 'raster',
    source: {
      type: 'raster',
      tiles: [
        'https://earthengine.google.org/static/hansen_2013/gain_alpha/{z}/{x}/{y}.png'
      ],
      tileSize: 256
    },
    layers: [{
      id: 'gain_layer',
      name: 'Tree cover gain',
      type: 'raster',
      source: 'gain',
      minzoom: 0,
      legendConfig: {
        type: 'basic',
        toggle: { layerId: 'gain' },
        color: '#6D6DE5',
        items: [
          { name: 'Tree cover gain', color: '#6D6DE5' }
        ]
      },
      paint: {
        'raster-opacity': 1,
        'raster-hue-rotate': 0,
        'raster-brightness-min': 0,
        'raster-brightness-max': 1,
        'raster-saturation': 0,
        'raster-contrast': 0
      }
    }]
  },
  {
    id: 'protected_areas',
    provider: 'geojson',
    source: {
      type: 'geojson',
      data: {
        url: `https://simbiotica.carto.com/api/v2/sql?q=${encodeURIComponent('SELECT * FROM wdpa_protected_areas WHERE iso3 IN (\'COG\', \'COD\', \'CMR\', \'CAF\', \'GAB\')')}&format=geojson`,
        method: 'GET'
      }
    },
    layers: [{
      id: 'protected_areas_layer',
      name: 'Protected areas',
      type: 'fill',
      source: 'protected_areas',
      before: ['loss_layer', 'gain_layer', 'forest_concession_layer', 'forest_concession_layer_hover'],
      minzoom: 0,
      legendConfig: {
        type: 'basic',
        toggle: { layerId: 'protected_areas' },
        color: '#5ca2d1',
        items: [
          { name: 'Protected areas', color: '#5ca2d1' }
        ]
      },
      paint: {
        'fill-color': '#5ca2d1',
        'fill-opacity': 0.4,
        'fill-outline-color': '#5ca2d1'
      }
    }]
  },

  // FMUS
  {
    id: 'forest_concession',
    provider: 'geojson',
    source: {
      type: 'geojson',
      data: {
        url: `${process.env.OTP_API}/fmus?country_ids=${process.env.OTP_COUNTRIES_IDS.join(',')}&format=geojson`,
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'OTP-API-KEY': process.env.OTP_API_KEY
        }
      }
    },
    layers: [{
      id: 'forest_concession_layer_hover',
      name: 'Forest managment units',
      type: 'fill',
      source: 'forest_concession',
      layout: {},
      before: ['loss_layer', 'gain_layer'],
      paint: {
        'fill-color': {
          property: 'fmu_type_label',
          type: 'categorical',
          stops: [['ventes_de_coupe', '#d07500'], ['ufa', '#d07500'], ['communal', '#d07500'], ['PEA', '#d07500'], ['CPAET', '#d07500'], ['CFAD', '#d07500']],
          default: '#d07500'
        },
        'fill-opacity': 0.4,
        'fill-outline-color': {
          property: 'fmu_type_label',
          type: 'categorical',
          stops: [['ventes_de_coupe', '#d07500'], ['ufa', '#d07500'], ['communal', '#d07500'], ['PEA', '#d07500'], ['CPAET', '#d07500'], ['CFAD', '#d07500']],
          default: '#d07500'
        }
      },
      filter: ['==', 'cartodb_id', '']
    }, {
      id: 'forest_concession_layer',
      name: 'Forest managment units',
      type: 'fill',
      source: 'forest_concession',
      layout: {},
      legendConfig: {
        type: 'basic',
        toggle: { layerId: 'forest_concession' },
        color: '#e98300',
        items: [
          { name: 'FMU', color: '#e98300' },
          {
            name: 'Cameroon',
            group: true,
            items: [
              { name: 'ventes_de_coupe', color: '#e92000' },
              { name: 'ufa', color: '#e95800' },
              { name: 'communal', color: '#e9A700' }
            ]
          },
          {
            name: 'Central African Republic',
            group: true,
            items: [
              { name: 'PEA', color: '#e9D400' }
            ]
          },
          {
            name: 'Gabon',
            group: true,
            items: [
              { name: 'CPAET', color: '#e9F200' },
              { name: 'CFAD', color: '#e9FF00' }
            ]
          }
        ]
      },
      before: ['loss_layer', 'gain_layer'],
      paint: {
        'fill-color': {
          property: 'fmu_type_label',
          type: 'categorical',
          stops: [['ventes_de_coupe', '#e92000'], ['ufa', '#e95800'], ['communal', '#e9A600'], ['PEA', '#e9D400'], ['CPAET', '#e9F200'], ['CFAD', '#e9FF00']],
          default: '#e98300'
        },
        'fill-opacity': 0.4,

        'fill-outline-color': {
          property: 'fmu_type_label',
          type: 'categorical',
          stops: [['ventes_de_coupe', '#d07500'], ['ufa', '#d07500'], ['communal', '#d07500'], ['PEA', '#d07500'], ['CPAET', '#d07500'], ['CFAD', '#d07500']],
          default: '#d07500'
        }
      },
      fitBounds: true,
      interactivity: {
        click(e) {
          // Remove always the popup if exists and you are using 'closeOnClick'
          // You will prevent a bug that doesn't show the popup again
          this.popup && this.popup.remove();
          this.popup = new this.Popup();

          const props = e.features[0].properties;

          // TODO: to translate popup we need to refactor all the map
          const fmuTypes = {
            en: {
              ufa: 'UFA',
              PEA: 'PEA',
              CPAET: 'CPAET',
              CFAD: 'CFAD',
              ventes_de_coupe: 'Sale of standing volume',
              communal: 'Communal forest'
            },
            fr: {
              ufa: 'UFA',
              PEA: 'PEA',
              CPAET: 'CPAET',
              CFAD: 'CFAD',
              ventes_de_coupe: 'Vente de coupe',
              communal: 'Forêt communale'
            },
            ch: {
              ufa: 'UFA',
              PEA: 'PEA',
              CPAET: 'CPAET',
              CFAD: 'CFAD',
              ventes_de_coupe: 'Vente de coupe',
              communal: 'Communal'
            }
          };

          this.popup.setLngLat(e.lngLat)
            .setDOMContent(
            render(
              Popup({
                id: props.id,
                title: props.fmu_name,
                operator: {
                  id: props.operator_id,
                  name: props.company_na
                },
                fmu_type: props.fmu_type_label,
                list: [{
                  label: 'Company',
                  value: props.company_na
                }, {
                  label: 'CCF status',
                  value: props.ccf_status
                }, {
                  label: 'Type',
                  value: fmuTypes[Cookies.get('language') || 'en'][props.fmu_type_label]
                }, {
                  label: 'Exploitant',
                  value: props.exploitant
                }]
              }),
              window.document.createElement('div')
            )
            )
            .addTo(this.map);
        },
        mouseenter() {
          this.map.getCanvas().style.cursor = 'pointer';
        },
        mousemove(e) {
          const value = e.features[0].properties.id || false;

          this.map.getCanvas().style.cursor = 'pointer';
          this.map.setFilter('forest_concession_layer_hover', ['==', 'id', value]);
        },
        mouseleave() {
          this.map.getCanvas().style.cursor = '';
          this.map.setFilter('forest_concession_layer_hover', ['==', 'id', '']);
        }
      }
    }]
  },
  // {
  //   id: 'harvestable_areas',
  //   provider: 'geojson',
  //   source: {
  //     type: 'geojson',
  //     data: `${process.env.OTP_API}/harvestable_areas?country_ids=${process.env.OTP_COUNTRIES_IDS.join(',')}`
  //     data: `https://simbiotica.carto.com/api/v2/sql?q=${encodeURIComponent('SELECT * FROM harvestable_areas')}&format=geojson`
  //   },
  //   layers: [{
  //     id: 'harvestable_areas_layer',
  //     type: 'fill',
  //     source: 'harvestable_areas',
  //     layout: {},
  //     paint: {
  //       'fill-color': '#005b23',
  //       'fill-opacity': 0.8,
  //       'fill-outline-color': '#004219'
  //     },
  //     interactivity: {
  //       click(e) {
  //         // Remove always the popup if exists and you are using 'closeOnClick'
  //         this.popup && this.popup.remove();
  //         this.popup = new this.Popup();
  //
  //         const props = e.features[0].properties;
  //
  //         this.popup.setLngLat(e.lngLat)
  //           .setDOMContent(
  //             render(
  //               Popup({
  //                 title: props.num_ccf,
  //                 list: []
  //               }),
  //               window.document.createElement('div')
  //             )
  //           )
  //           .addTo(this.map);
  //       }
  //     }
  //   }]
  // }

  {
    id: 'COG',
    provider: 'geojson',
    source: {
      type: 'geojson',
      data: {
        url: 'https://api.resourcewatch.org/v2/geostore/admin/COG?simplify=0.0000001',
        method: 'GET',
        parse: data => data.data.attributes.geojson
      }
    },
    layers: [{
      id: 'COG_layer',
      name: 'COG country layer',
      type: 'line',
      before: [],
      source: 'COG',
      minzoom: 0,
      update({ COUNTRY_IDS }, l) {
        if (!COUNTRY_IDS.includes(47)) {
          if (this.map.getLayer(l.id)) {
            this.map.removeLayer(l.id);
            delete this.mapLayers[l.id];
          }

          this.removeLayer(l.id);
        } else if (!this.map.getLayer(l.id)) {
          this.map.addLayer(l);
        }
      },
      paint: {
        'line-color': '#333333',
        'line-width': 2,
        'line-opacity': 0.8
      }
    }]
  },

  {
    id: 'COD',
    provider: 'geojson',
    source: {
      type: 'geojson',
      data: {
        url: 'https://api.resourcewatch.org/v2/geostore/admin/COD?simplify=0.0000001',
        method: 'GET',
        parse: data => data.data.attributes.geojson
      }
    },
    layers: [{
      id: 'COD_layer',
      name: 'COD country layer',
      type: 'line',
      before: [],
      source: 'COD',
      update({ COUNTRY_IDS }, l) {
        if (!COUNTRY_IDS.includes(7)) {
          if (this.map.getLayer(l.id)) {
            this.map.removeLayer(l.id);
            delete this.mapLayers[l.id];
          }
        } else if (!this.map.getLayer(l.id)) {
          this.map.addLayer(l);
        }
      },
      minzoom: 0,
      paint: {
        'line-color': '#333333',
        'line-width': 2,
        'line-opacity': 0.8
      }
    }]
  },

  {
    id: 'CMR',
    provider: 'geojson',
    source: {
      type: 'geojson',
      data: {
        url: 'https://api.resourcewatch.org/v2/geostore/admin/CMR?simplify=0.0000001',
        method: 'GET',
        parse: data => data.data.attributes.geojson
      }
    },
    layers: [{
      id: 'CMR_layer',
      name: 'CMR country layer',
      type: 'line',
      before: [],
      source: 'CMR',
      update({ COUNTRY_IDS }, l) {
        if (!COUNTRY_IDS.includes(45)) {
          if (this.map.getLayer(l.id)) {
            this.map.removeLayer(l.id);
            delete this.mapLayers[l.id];
          }
        } else if (!this.map.getLayer(l.id)) {
          this.map.addLayer(l);
        }
      },
      minzoom: 0,
      paint: {
        'line-color': '#333333',
        'line-width': 2,
        'line-opacity': 0.8
      }
    }]
  },

  {
    id: 'GAB',
    provider: 'geojson',
    source: {
      type: 'geojson',
      data: {
        url: 'https://api.resourcewatch.org/v2/geostore/admin/GAB?simplify=0.0000001',
        method: 'GET',
        parse: data => data.data.attributes.geojson
      }
    },
    layers: [{
      id: 'GAB_layer',
      name: 'GAB country layer',
      type: 'line',
      before: [],
      source: 'GAB',
      update({ COUNTRY_IDS }, l) {
        if (!COUNTRY_IDS.includes(53)) {
          if (this.map.getLayer(l.id)) {
            this.map.removeLayer(l.id);
            delete this.mapLayers[l.id];
          }
        } else if (!this.map.getLayer(l.id)) {
          this.map.addLayer(l);
        }
      },
      minzoom: 0,
      paint: {
        'line-color': '#333333',
        'line-width': 2,
        'line-opacity': 0.8
      }
    }]
  },

  {
    id: 'CAF',
    provider: 'geojson',
    source: {
      type: 'geojson',
      data: {
        url: 'https://api.resourcewatch.org/v2/geostore/admin/CAF?simplify=0.0000001',
        method: 'GET',
        parse: data => data.data.attributes.geojson
      }
    },
    layers: [{
      id: 'CAF_layer',
      name: 'CAF country layer',
      type: 'line',
      before: [],
      source: 'CAF',
      update({ COUNTRY_IDS }, l) {
        if (!COUNTRY_IDS.includes(188)) {
          if (this.map.getLayer(l.id)) {
            this.map.removeLayer(l.id);
            delete this.mapLayers[l.id];
          }
        } else if (!this.map.getLayer(l.id)) {
          this.map.addLayer(l);
        }
      },
      minzoom: 0,
      paint: {
        'line-color': '#333333',
        'line-width': 2,
        'line-opacity': 0.8
      }
    }]
  }
];

export { MAP_LAYERS_OPERATORS };
