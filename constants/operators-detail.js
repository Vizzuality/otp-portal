import React from 'react';
import { render } from 'react-dom';
import Popup from 'components/map/popup';

const TABS_OPERATORS_DETAIL = [{
  label: 'overview',
  value: 'overview'
}, {
  label: 'documentation',
  value: 'documentation',
  number: '65%'
}, {
  label: 'observations',
  value: 'observations',
  number: 120
}, {
  label: 'operator-detail.tabs.fmus',
  value: 'fmus',
  number: 7
}];

const MAP_LAYERS_OPERATORS_DETAIL = [
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
      type: 'raster',
      source: 'loss',
      minzoom: 0,
      legendConfig: {
        type: 'basic',
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
      type: 'raster',
      source: 'gain',
      minzoom: 0,
      legendConfig: {
        type: 'basic',
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
    id: 'forest_concession',
    provider: 'geojson',
    source: {
      type: 'geojson',
      data: {
        url: `${process.env.OTP_API}/fmus?country_ids=${process.env.OTP_COUNTRIES_IDS.join(',')}&operator_ids={{OPERATOR_ID}}&format=geojson`,
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'OTP-API-KEY': process.env.OTP_API_KEY
        }
      }
    },
    layers: [{
      id: 'forest_concession_layer_selected',
      name: 'Forest managment units',
      type: 'fill',
      source: 'forest_concession',
      layout: {},
      before: ['loss_layer', 'gain_layer'],
      paint: {
        'fill-color': '#d07500',
        'fill-opacity': 1,
        'fill-outline-color': 'green'
      },
      filter: ['==', 'id', ''],
      update(filters) {
        this.map.setFilter('forest_concession_layer_selected', ['==', 'id', parseInt(filters.FMU_ID, 10)]);
      }
    }, {
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
      type: 'fill',
      source: 'forest_concession',
      legendConfig: {
        type: 'basic',
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
      layout: {},
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
        click(e, callback) {
          callback(e);
        },
        mouseenter() {
          this.map.getCanvas().style.cursor = 'pointer';
        },
        mousemove(e) {
          this.map.getCanvas().style.cursor = 'pointer';
          this.map.setFilter('forest_concession_layer_hover', ['==', 'cartodb_id', e.features[0].properties.cartodb_id]);
        },
        mouseleave() {
          this.map.getCanvas().style.cursor = '';
          this.map.setFilter('forest_concession_layer_hover', ['==', 'cartodb_id', '']);
        }
      }
    }]
  },
  {
    id: 'sawmills',
    provider: 'geojson',
    source: {
      type: 'geojson',
      data: {
        url: `${process.env.OTP_API}/sawmills?country_ids=${process.env.OTP_COUNTRIES_IDS.join(',')}&operator_ids={{OPERATOR_ID}}&format=geojson`,
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'OTP-API-KEY': process.env.OTP_API_KEY
        }
      }
    },
    layers: [
      // {
      //   id: 'sawmills_layer_selected',
      //   name: 'Forest managment units',
      //   type: 'fill',
      //   source: 'sawmills',
      //   layout: {},
      //   before: ['loss_layer', 'gain_layer'],
      //   paint: {
      //     'fill-color': '#d07500',
      //     'fill-opacity': 1,
      //     'fill-outline-color': 'green'
      //   },
      //   filter: ['==', 'id', ''],
      //   update(filters) {
      //     this.map.setFilter('sawmills_layer_selected', ['==', 'id', parseInt(filters.FMU_ID, 10)]);
      //   }
      // },
      {
        id: 'sawmills_layer_hover',
        name: 'Sawmills',
        type: 'circle',
        source: 'sawmills',
        layout: {},
        before: ['loss_layer', 'gain_layer'],
        paint: {
          'circle-color': '#d07500',
          'circle-opacity': 0.4,
          'circle-radius': 12
        },
        filter: ['==', 'id', '']
      },
      {
        id: 'sawmills_layer',
        type: 'circle',
        source: 'sawmills',
        layout: {},
        before: ['loss_layer', 'gain_layer'],
        paint: {
          'circle-color': '#e98300',
          'circle-opacity': 1,
          'circle-radius': 10
        },
        interactivity: {
          click(e) {
          // Remove always the popup if exists and you are using 'closeOnClick'
          // You will prevent a bug that doesn't show the popup again
            this.popup && this.popup.remove();
            this.popup = new this.Popup();

            const props = e.features[0].properties;
            this.popup.setLngLat(e.lngLat)
            .setDOMContent(
            render(
              Popup({
                title: props.name
              }),
              window.document.createElement('div')
            )
            )
            .addTo(this.map);
          }
          // mouseenter() {
          //   this.map.getCanvas().style.cursor = 'pointer';
          // },
          // mousemove(e) {
          //   this.map.getCanvas().style.cursor = 'pointer';
          //   this.map.setFilter('sawmills_layer_hover', ['==', 'id', e.features[0].properties.id]);
          // },
          // mouseleave() {
          //   this.map.getCanvas().style.cursor = '';
          //   this.map.setFilter('sawmills_layer_hover', ['==', 'id', '']);
          // }
        }
      }
    ]
  }

];

export {
  TABS_OPERATORS_DETAIL,
  MAP_LAYERS_OPERATORS_DETAIL
};
