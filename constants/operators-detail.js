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
  label: 'fmus',
  value: 'fmus',
  number: 7
}];


const TABS_DOCUMENTATION_OPERATORS_DETAIL = [{
  label: 'Operator documents',
  value: 'operator-documents'
}, {
  label: 'FMUs documents',
  value: 'fmus-documents'
}, {
  label: 'Chronological view',
  value: 'chronological-view'
}];


const MAP_OPTIONS_OPERATORS_DETAIL = {
  zoom: 5,
  center: [18, 0],
  scrollZoom: false
};

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
        'http://earthengine.google.org/static/hansen_2013/gain_alpha/{z}/{x}/{y}.png'
      ],
      tileSize: 256
    },
    layers: [{
      id: 'gain_layer',
      type: 'raster',
      source: 'gain',
      minzoom: 0,
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
        url: `${process.env.OTP_API}/fmus?country_ids=7,47&operator_ids={{OPERATOR_ID}}&format=geojson`,
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'OTP-API-KEY': process.env.OTP_API_KEY
        }
      }
    },
    layers: [{
      id: 'forest_concession_layer_hover',
      type: 'fill',
      source: 'forest_concession',
      layout: {},
      before: ['loss_layer', 'gain_layer'],
      paint: {
        'fill-color': '#d07500',
        'fill-opacity': 0.4,
        'fill-outline-color': '#d07500'
      },
      filter: ['==', 'cartodb_id', '']
    }, {
      id: 'forest_concession_layer',
      type: 'fill',
      source: 'forest_concession',
      layout: {},
      before: ['loss_layer', 'gain_layer'],
      paint: {
        'fill-color': '#e98300',
        'fill-opacity': 0.4,
        'fill-outline-color': '#d07500'
      },
      fitBounds: true,
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
                  title: props.fmu_name,
                  list: [{
                    label: 'Company',
                    value: props.company_na
                  }, {
                    label: 'CCF status',
                    value: props.ccf_status
                  }, {
                    label: 'Type',
                    value: props.fmu_type
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
          this.map.getCanvas().style.cursor = 'pointer';
          this.map.setFilter('forest_concession_layer_hover', ['==', 'cartodb_id', e.features[0].properties.cartodb_id]);
        },
        mouseleave() {
          this.map.getCanvas().style.cursor = '';
          this.map.setFilter('forest_concession_layer_hover', ['==', 'cartodb_id', '']);
        }
      }
    }]
  }
];


const TABLE_HEADERS_ILLEGALITIES = [
  {
    Header: <span className="sortable">date</span>,
    accessor: 'date',
    headerClassName: '-a-left',
    className: '-a-left',
    minWidth: 75,
    Cell: (attr) => {
      const date = new Date(attr.value);
      const monthName = date ? date.toLocaleString('en-us', { month: 'short' }) : '-';
      const year = date ? date.getFullYear() : '-';
      return <span>{`${monthName} ${year}`}</span>;
    }
  },
  {
    Header: <span className="sortable">Severity</span>,
    accessor: 'severity',
    headerClassName: '-a-center',
    className: '-a-left severity',
    minWidth: 150,
    Cell: attr => <span className={`severity-item -sev-${attr.value}`}>{attr.value}</span>
  },
  {
    Header: <span>Description</span>,
    accessor: 'details',
    headerClassName: '-a-left',
    className: 'description',
    sortable: false,
    minWidth: 420,
    Cell: attr => <p>{attr.value}</p>
  },
  // not ready
  {
    Header: <span>Evidences</span>,
    accessor: 'report',
    sortable: false,
    headerClassName: '-a-left',
    minWidth: 150,
    Cell: (attr) => {
      if (attr.value && attr.value.attachment && attr.value.attachment.url) {
        return (
          <a
            className="evidence-link"
            href={attr.value.attachment.url || '#'}
            target="_blank"
            rel="noopener noreferrer"
            title={attr.value.title}
          >
            Document
          </a>
        );
      }

      return null;
    }
  }
];

export {
  TABS_OPERATORS_DETAIL,
  TABS_DOCUMENTATION_OPERATORS_DETAIL,
  MAP_OPTIONS_OPERATORS_DETAIL,
  MAP_LAYERS_OPERATORS_DETAIL,
  TABLE_HEADERS_ILLEGALITIES
};
