import React, { Fragment } from 'react';
import PropTypes from 'prop-types';

import * as Cookies from 'js-cookie';

// Toastr
import { toastr } from 'react-redux-toastr';

import withTracker from 'components/layout/with-tracker';

// Intl
import withIntl from 'hoc/with-intl';
import { intlShape } from 'react-intl';

// Services
import modal from 'services/modal';

// Components
import Layout from 'components/layout/layout';
import StaticSection from 'components/ui/static-section';
import Card from 'components/ui/card';
import Map from 'components/map-new';
import LayerManager from 'components/map-new/layer-manager';
import FAAttributions from 'components/map-new/fa-attributions';
import Search from 'components/ui/search';

class HomePage extends React.Component {
  static async getInitialProps({ url }) {
    return { url };
  }
  /**
   * COMPONENT LIFECYCLE
  */
  componentDidMount() {
    // if (!Cookies.get('home.disclaimer')) {
    //   toastr.info(
    //     'Info',
    //     this.props.intl.formatMessage({ id: 'home.disclaimer' }),
    //     {
    //       id: 'home.disclaimer',
    //       className: '-disclaimer',
    //       position: 'bottom-right',
    //       timeOut: 0,
    //       onCloseButtonClick: () => {
    //         Cookies.set('home.disclaimer', true);
    //       }
    //     }
    //   );
    // }
  }

  componentWillUnMount() {
    // toastr.remove('home.disclaimer');

    // Attribution listener
    document.getElementById('forest-atlas-attribution').removeEventListener('click', this.onCustomAttribute);
  }

  onCustomAttribute = (e) => {
    e.preventDefault();
    modal.toggleModal(true, {
      children: FAAttributions
    });
  }


  render() {
    const { url } = this.props;

    return (
      <Layout
        title="Home"
        description="Home description..."
        url={url}
      >
        {/* INTRO */}
        <StaticSection
          background="/static/images/home/bg-intro.jpg"
          position={{ bottom: true, left: true }}
          column={9}
        >
          <div className="c-intro">
            <h2
              dangerouslySetInnerHTML={{
                __html: this.props.intl.formatHTMLMessage({ id: 'home.intro' })
              }}
            />
          </div>
        </StaticSection>

        {/* SECTION A */}
        <StaticSection
          background="/static/images/home/bg-a.jpg"
          position={{ top: true, left: true }}
          column={5}
        >
          <Card
            theme="-secondary -theme-home"
            letter="A"
            title={this.props.intl.formatMessage({ id: 'home.card.a.title' })}
            description={this.props.intl.formatMessage({
              id: 'home.card.a.description'
            })}
            link={{
              label: this.props.intl.formatMessage({
                id: 'home.card.a.link.label'
              }),
              href: '/operators'
            }}
          />
        </StaticSection>

        {/* SECTION B */}
        <StaticSection
          map={
            <Map
              mapStyle="mapbox://styles/mapbox/light-v9"
              viewport={{
                zoom: 5,
                latitude: 0,
                longitude: 20
              }}
              scrollZoom={false}
              dragPan={false}
              dragRotate={false}
              transformRequest={(uri) => {
                if (uri.startsWith(process.env.OTP_API)) {
                  return {
                    url: uri,
                    headers: {
                      'Content-Type': 'application/json',
                      'OTP-API-KEY': process.env.OTP_API_KEY
                    }
                  };
                }

                return null;
              }}

              onLoad={() => {
                // Attribution listener
                document.getElementById('forest-atlas-attribution').addEventListener('click', this.onCustomAttribute);
              }}

              mapOptions={{
                customAttribution: '<a id="forest-atlas-attribution" href="http://cod.forest-atlas.org/?l=en" rel="noopener noreferrer" target="_blank">Forest Atlas</a>'
              }}
            >
              {map => (
                <Fragment>
                  {/* LAYER MANAGER */}
                  <LayerManager
                    map={map}
                    layers={[
                      {
                        id: 'gain',
                        type: 'raster',
                        source: {
                          tiles: [
                            'https://earthengine.google.org/static/hansen_2013/gain_alpha/{z}/{x}/{y}.png'
                          ]
                        }
                      },
                      {
                        id: 'loss',
                        type: 'raster',
                        source: {
                          tiles: [
                            'https://storage.googleapis.com/wri-public/Hansen_16/tiles/hansen_world/v1/tc30/{z}/{x}/{y}.png'
                          ]
                        },
                        decodeParams: {
                          startYear: 2001,
                          endYear: 2018
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
                        id: 'fmus',
                        type: 'vector',
                        source: {
                          type: 'vector',
                          tiles: [`${process.env.OTP_API}/fmus/tiles/{z}/{x}/{y}`]
                        },
                        render: {
                          layers: [
                            {
                              type: 'fill',
                              'source-layer': 'layer0',
                              filter: [
                                'all',
                                ['in', ['get', 'iso3_fmu'], ['literal', '{country_iso_codes}']],
                                ['==', ['get', 'iso3_fmu'], 'COD']
                              ],
                              paint: {
                                'fill-color': '#5ca2d1',
                                'fill-opacity': 0.9
                              }
                            },
                            {
                              type: 'fill',
                              'source-layer': 'layer0',
                              filter: [
                                'all',
                                ['in', ['get', 'iso3_fmu'], ['literal', '{country_iso_codes}']],
                                ['==', ['get', 'iso3_fmu'], 'COG']
                              ],
                              paint: {
                                'fill-color': '#7B287D',
                                'fill-opacity': 0.9
                              }
                            },
                            {
                              type: 'fill',
                              'source-layer': 'layer0',
                              filter: [
                                'all',
                                ['in', ['get', 'iso3_fmu'], ['literal', '{country_iso_codes}']],
                                ['==', ['get', 'iso3_fmu'], 'CMR']
                              ],
                              paint: {
                                'fill-color': {
                                  property: 'fmu_type_label',
                                  type: 'categorical',
                                  stops: [
                                    ['ventes_de_coupe', '#8BC2B5'],
                                    ['ufa', '#007A5E'],
                                    ['communal', '#00382B']
                                  ],
                                  default: '#007A5E'
                                },
                                'fill-opacity': 0.9
                              }
                            },
                            {
                              type: 'fill',
                              'source-layer': 'layer0',
                              filter: [
                                'all',
                                ['in', ['get', 'iso3_fmu'], ['literal', '{country_iso_codes}']],
                                ['==', ['get', 'iso3_fmu'], 'GAB']
                              ],
                              paint: {
                                'fill-color': {
                                  property: 'fmu_type_label',
                                  type: 'categorical',
                                  stops: [
                                    ['CPAET', '#e95800'],
                                    ['CFAD', '#e9A600']
                                  ],
                                  default: '#e95800'
                                },

                                'fill-opacity': 0.9
                              }
                            },
                            {
                              type: 'fill',
                              'source-layer': 'layer0',
                              filter: [
                                'all',
                                ['in', ['get', 'iso3_fmu'], ['literal', '{country_iso_codes}']],
                                ['==', ['get', 'iso3_fmu'], 'CAF']
                              ],
                              paint: {
                                'fill-color': '#e9D400',
                                'fill-opacity': 0.9
                              }
                            },
                            {
                              type: 'line',
                              'source-layer': 'layer0',
                              filter: [
                                'all',
                                ['in', ['get', 'iso3_fmu'], ['literal', '{country_iso_codes}']]
                              ],
                              paint: {
                                'line-color': '#000000',
                                'line-opacity': [
                                  'case',
                                  ['boolean', ['feature-state', 'hover'], false],
                                  1,
                                  0.1
                                ],
                                'line-width': [
                                  'case',
                                  ['boolean', ['feature-state', 'hover'], false],
                                  2,
                                  1
                                ],
                                'line-dasharray': [3, 1]
                              }
                            },
                            {
                              type: 'line',
                              'source-layer': 'layer0',
                              filter: [
                                'all',
                                ['in', ['get', 'iso3_fmu'], ['literal', '{country_iso_codes}']]
                              ],
                              paint: {
                                'line-color': '#000000',
                                'line-opacity': 0.1
                              }
                            },
                            {
                              type: 'line',
                              'source-layer': 'layer0',
                              filter: [
                                'all',
                                ['==', 'id', '{hoverId}']
                              ],
                              paint: {
                                'line-dasharray': [3, 1],
                                'line-opacity': 1,
                                'line-width': 2
                              }
                            }
                          ]
                        },
                        params: {
                          country_iso_codes: process.env.OTP_COUNTRIES
                        }
                      },
                      {
                        id: 'protected-areas',
                        type: 'vector',
                        source: {
                          type: 'vector',
                          provider: {
                            type: 'carto',
                            account: 'wri-01',
                              // api_key: 'añsdlkjfñaklsjdfklñajsdfñlkadjsf',
                            layers: [
                              {
                                options: {
                                  sql: 'SELECT * FROM wdpa_protected_areas'
                                },
                                type: 'cartodb'
                              }
                            ]
                          }
                        },
                        render: {
                          layers: [
                            {
                              type: 'fill',
                              'source-layer': 'layer0',
                              filter: [
                                'all',
                                ['in', ['get', 'iso3'], ['literal', '{country_iso_codes}']]
                              ],
                              paint: {
                                'fill-color': '#CCCCCC',
                                'fill-opacity': 1
                              }
                            }
                          ]
                        },
                        params: {
                          country_iso_codes: process.env.OTP_COUNTRIES
                        }
                      }
                    ]}
                  />
                </Fragment>
                )}
            </Map>
          }
          position={{ top: true, right: true }}
          column={5}
        >
          <Card
            theme="-tertiary -theme-home"
            letter="B"
            title={this.props.intl.formatMessage({ id: 'home.card.b.title' })}
            description={this.props.intl.formatMessage({
              id: 'home.card.b.description'
            })}
            link={false}
            Component={<Search theme="-theme-static" />}
          />
        </StaticSection>

        {/* SECTION C */}
        <StaticSection
          background="/static/images/home/bg-c.jpg"
          position={{ top: true, left: true }}
          column={5}
        >
          <Card
            theme="-secondary -theme-home"
            letter="C"
            title={this.props.intl.formatMessage({ id: 'home.card.c.title' })}
            description={this.props.intl.formatMessage({
              id: 'home.card.c.description'
            })}
            link={{
              label: this.props.intl.formatMessage({
                id: 'home.card.c.link.label'
              }),
              href: '/observations'
            }}
          />
        </StaticSection>
      </Layout>
    );
  }
}

HomePage.propTypes = {
  url: PropTypes.shape({}).isRequired,
  intl: intlShape.isRequired
};


export default withTracker(withIntl(HomePage));
