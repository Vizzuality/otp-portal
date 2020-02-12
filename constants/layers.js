export const LAYERS = [
  {
    id: 'gain',
    name: 'Tree cover gain',
    config: {
      type: 'raster',
      source: {
        tiles: [
          'https://earthengine.google.org/static/hansen_2013/gain_alpha/{z}/{x}/{y}.png'
        ],
        minzoom: 3,
        maxzoom: 12
      }
    },
    legendConfig: {
      type: 'basic',
      items: [
        { name: 'Tree cover gain', color: '#6D6DE5' }
      ]
    }
  },
  {
    id: 'loss',
    name: 'Tree cover loss',
    config: {
      type: 'raster',
      source: {
        tiles: [
          'https://storage.googleapis.com/wri-public/Hansen_16/tiles/hansen_world/v1/tc30/{z}/{x}/{y}.png'
        ],
        minzoom: 3,
        maxzoom: 12
      }
    },
    legendConfig: {
      enabled: true
    },
    decodeConfig: [
      {
        default: '2001-01-01',
        key: 'startDate',
        required: true
      },
      {
        default: '2018-12-31',
        key: 'endDate',
        required: true
      }
    ],
    timelineConfig: {
      step: 1,
      speed: 250,
      interval: 'years',
      dateFormat: 'YYYY',
      trimEndDate: '2018-12-31',
      maxDate: '2018-12-31',
      minDate: '2001-01-01',
      canPlay: true,
      railStyle: {
        background: '#DDD'
      },
      trackStyle: [
        {
          background: '#dc6c9a'
        },
        {
          background: '#982d5f'
        }
      ]
    },
    decodeFunction: `
      // values for creating power scale, domain (input), and range (output)
      float domainMin = 0.;
      float domainMax = 255.;
      float rangeMin = 0.;
      float rangeMax = 255.;

      float exponent = zoom < 13. ? 0.3 + (zoom - 3.) / 20. : 1.;
      float intensity = color.r * 255.;

      // get the min, max, and current values on the power scale
      float minPow = pow(domainMin, exponent - domainMin);
      float maxPow = pow(domainMax, exponent);
      float currentPow = pow(intensity, exponent);

      // get intensity value mapped to range
      float scaleIntensity = ((currentPow - minPow) / (maxPow - minPow) * (rangeMax - rangeMin)) + rangeMin;
      // a value between 0 and 255
      alpha = zoom < 13. ? scaleIntensity / 255. : color.g;

      float year = 2000.0 + (color.b * 255.);
      // map to years
      if (year >= startYear && year <= endYear && year >= 2001.) {
        color.r = 220. / 255.;
        color.g = (72. - zoom + 102. - 3. * scaleIntensity / zoom) / 255.;
        color.b = (33. - zoom + 153. - intensity / zoom) / 255.;
      } else {
        alpha = 0.;
      }
    `
  },
  {
    id: 'glad',
    name: 'GLAD alerts',
    config: {
      type: 'raster',
      source: {
        tiles: [
          'https://tiles.globalforestwatch.org/glad_prod/tiles/{z}/{x}/{y}.png'
        ],
        minzoom: 2,
        maxzoom: 12
      }
    },
    legendConfig: {
      enabled: true
    },
    decodeConfig: [
      {
        default: '2015-01-01',
        key: 'startDate',
        required: true
      },
      {
        default: '2020-01-30',
        key: 'endDate',
        required: true,
        url: 'https://production-api.globalforestwatch.org/v1/glad-alerts/latest'
      },
      {
        default: 1,
        key: 'confirmedOnly',
        required: true
      }
    ],
    decodeFunction: `
      // values for creating power scale, domain (input), and range (output)
      float confidenceValue = 0.;
      if (confirmedOnly > 0.) {
        confidenceValue = 200.;
      }
      float day = color.r * 255. * 255. + (color.g * 255.);
      float confidence = color.b * 255.;
      if (
        day > 0. &&
        day >= startDayIndex &&
        day <= endDayIndex &&
        confidence >= confidenceValue
      ) {
        // get intensity
        float intensity = mod(confidence, 100.) * 50.;
        if (intensity > 255.) {
          intensity = 255.;
        }
        if (day >= numberOfDays - 7. && day <= numberOfDays) {
          color.r = 255. / 255.;
          color.g = 255. / 255.;
          color.b = 0.;
          alpha = intensity / 255.;
        } else {
          color.r = 255. / 255.;
          color.g = 0. / 255.;
          color.b = 0. / 255.;
          alpha = intensity / 255.;
        }
      } else {
        alpha = 0.;
      }
    `,
    timelineConfig: {
      step: 7,
      speed: 100,
      interval: 'days',
      dateFormat: 'YYYY-MM-DD',
      trimEndDate: '2020-01-30',
      maxDate: '2020-01-30',
      minDate: '2015-01-01',
      canPlay: true,
      railStyle: {
        background: '#DDD'
      },
      trackStyle: [
        {
          background: '#FF0000'
        },
        {
          background: '#CC0000'
        }
      ]
    }

  },
  {
    id: 'fmus',
    name: 'Forest managment units',
    config: {
      type: 'geojson',
      source: {
        type: 'geojson',
        data: `${process.env.OTP_API}/fmus?country_ids=188,53&operator_ids={operator_id}&format=geojson`
      },
      render: {
        layers: [
          {
            type: 'fill',
            source: 'fmus',
            paint: {
              'fill-color': {
                property: 'fmu_type_label',
                type: 'categorical',
                stops: [
                  ['ventes_de_coupe', '#e92000'],
                  ['ufa', '#e95800'],
                  ['communal', '#e9A600'],
                  ['PEA', '#e9D400'],
                  ['CPAET', '#e9E200'],
                  ['CFAD', '#e9FF00']
                ],
                default: '#e98300'
              },
              'fill-opacity': 0.9
            }
          },
          {
            type: 'line',
            source: 'fmus',
            paint: {
              'line-color': '#000000',
              'line-opacity': 0.1
            }
          },
          {
            type: 'line',
            filter: [
              'all',
              ['==', 'id', '{clickId}']
            ],
            paint: {
              'line-opacity': 1,
              'line-width': 2
            }
          },
          {
            type: 'line',
            filter: [
              'all',
              ['==', 'id', '{hoverId}'],
              ['!=', 'id', '{clickId}']
            ],
            paint: {
              'line-dasharray': [3, 1],
              'line-opacity': 1,
              'line-width': 2
            }
          }
        ]
      }
    },
    paramsConfig: [
      { key: 'operator_id', default: '', required: false }
    ],
    legendConfig: {
      type: 'basic',
      color: '#e98300',
      items: [
        {
          name: 'Central African Republic',
          hideIcon: true,
          items: [
            { name: 'PEA', color: '#e9D400' }
          ]
        },
        {
          name: 'Gabon',
          hideIcon: true,
          items: [
            { name: 'CPAET', color: '#e9F200' },
            { name: 'CFAD', color: '#e9FF00' }
          ]
        }
      ]
    },
    interactionConfig: {
      enable: true,
      output: [
        {
          column: 'fmu_name',
          label: 'Name'
        },
        {
          column: 'fmu_type_label',
          label: 'Type'
        },
        {
          column: 'company_na',
          label: 'Producer'
        }
      ]
    }
  },
  {
    id: 'protected-areas',
    name: 'Protected areas',
    config: {
      type: 'vector',
      source: {
        type: 'vector',
        provider: {
          type: 'carto',
          options: {
            account: 'wri-01',
            layers: [
              {
                options: {
                  cartocss: '#wdpa_protected_areas {  polygon-opacity: 1.0; polygon-fill: #704489 }',
                  cartocss_version: '2.3.0',
                  sql: 'SELECT * FROM wdpa_protected_areas'
                },
                type: 'mapnik'
              }
            ]
          }
        }
      },
      render: {
        layers: [
          {
            type: 'fill',
            'source-layer': 'layer0',
            paint: {
              'fill-color': '#5ca2d1',
              'fill-opacity': 1
            }
          },
          {
            type: 'line',
            'source-layer': 'layer0',
            paint: {
              'line-color': '#000000',
              'line-opacity': 0.1
            }
          }
        ]
      }
    },
    paramsConfig: [],
    legendConfig: {
      type: 'basic',
      items: [
        { name: 'Protected areas', color: '#5ca2d1' }
      ]
    }
  }
];
