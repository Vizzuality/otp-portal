const MAP_OPTIONS_HOME = {
  zoom: 5,
  center: [18, 0],
  scrollZoom: false,
  interactive: false
};

const MAP_LAYERS_HOME = [
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
        'https://earthengine.google.org/static/hansen_2013/gain_alpha/{z}/{x}/{y}.png'
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
        url: `${process.env.OTP_API}/fmus?country_ids=${process.env.OTP_COUNTRIES_IDS.join(',')}&format=geojson`,
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'OTP-API-KEY': process.env.OTP_API_KEY
        }
      }
    },
    layers: [{
      id: 'forest_concession_layer',
      type: 'fill',
      source: 'forest_concession',
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
      fitBounds: true
    }]
  }

  // {
  //   id: 'harvestable_areas',
  //   provider: 'geojson',
  //   source: {
  //     type: 'geojson',
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
  //     }
  //   }]
  // }
];

export { MAP_OPTIONS_HOME, MAP_LAYERS_HOME };
