import React from 'react';

// Redux
import { setUser } from 'modules/user';
import { setLanguage } from 'modules/language';
import { setRouter } from 'modules/router';
import { getOperators } from 'modules/operators';

import * as Cookies from 'js-cookie';

// Toastr
import { toastr } from 'react-redux-toastr';

import withTracker from 'components/layout/with-tracker';

// Intl
import withIntl from 'hoc/with-intl';
import { intlShape } from 'react-intl';

// Components
import Layout from 'components/layout/layout';
import StaticSection from 'components/ui/static-section';
import Card from 'components/ui/card';
import Map from 'components/map-new';
import LayerManager from 'components/map-new/layer-manager';
import Search from 'components/ui/search';

class HomePage extends React.Component {
  static async getInitialProps({ req, asPath, pathname, query, store, isServer }) {
    const { operators } = store.getState();
    const url = { asPath, pathname, query };
    let user = null;
    let lang = 'en';

    if (isServer) {
      lang = req.locale.language;
      user = req.session ? req.session.user : {};
    } else {
      lang = store.getState().language;
      user = store.getState().user;
    }

    store.dispatch(setLanguage(lang));
    store.dispatch(setUser(user));
    store.dispatch(setRouter(url));

    if (!operators.data.length) {
      await store.dispatch(getOperators());
    }

    return { isServer, url };
  }
  /**
   * COMPONENT LIFECYCLE
  */
  componentDidMount() {
    if (!Cookies.get('home.disclaimer')) {
      toastr.info(
        'Info',
        this.props.intl.formatMessage({ id: 'home.disclaimer' }),
        {
          id: 'home.disclaimer',
          className: '-disclaimer',
          position: 'bottom-right',
          timeOut: 0,
          onCloseButtonClick: () => {
            Cookies.set('home.disclaimer', true);
          }
        }
      );
    }
  }

  componentWillUnMount() {
    toastr.remove('home.disclaimer');
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
                __html: this.props.intl.formatHTMLMessage({ id: "home.intro" })
              }}
            />
            <h3>Temporary page for initial data upload</h3>
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
            title={this.props.intl.formatMessage({ id: "home.card.a.title" })}
            description={this.props.intl.formatMessage({
              id: "home.card.a.description"
            })}
            link={{
              label: this.props.intl.formatMessage({
                id: "home.card.a.link.label"
              }),
              href: "/operators"
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
              transformRequest={(url, resourceType)=> {
                if(resourceType == 'Source' && url.startsWith(process.env.OTP_API)) {
                  return {
                    url,
                    headers: {
                      'Content-Type': 'application/json',
                      'OTP-API-KEY': process.env.OTP_API_KEY
                    }
                  }
                }
              }}
            >
              {map => {
                return (
                  <>
                    {/* LAYER MANAGER */}
                    <LayerManager
                      map={map}
                      layers={[
                        {
                          id: "gain",
                          type: "raster",
                          source: {
                            tiles: [
                              "https://earthengine.google.org/static/hansen_2013/gain_alpha/{z}/{x}/{y}.png"
                            ]
                          }
                        },
                        {
                          id: "loss",
                          type: "raster",
                          source: {
                            tiles: [
                              `https://storage.googleapis.com/wri-public/Hansen_16/tiles/hansen_world/v1/tc30/{z}/{x}/{y}.png`
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
                          id: "forest_concession",
                          type: "geojson",
                          source: {
                            type: "geojson",
                            data: `${process.env.OTP_API}/fmus?country_ids=188,53&format=geojson`
                          },
                          render: {
                            layers: [
                              {
                                type: "fill",
                                source: "forest_concession",
                                paint: {
                                  "fill-color": {
                                    property: "fmu_type_label",
                                    type: "categorical",
                                    stops: [
                                      ["ventes_de_coupe", "#e92000"],
                                      ["ufa", "#e95800"],
                                      ["communal", "#e9A600"],
                                      ["PEA", "#e9D400"],
                                      ["CPAET", "#e9E200"],
                                      ["CFAD", "#e9FF00"]
                                    ],
                                    default: "#e98300"
                                  },
                                  "fill-opacity": 0.9
                                }
                              },
                              {
                                type: "line",
                                source: "forest_concession",
                                paint: {
                                  "line-color": "#000000",
                                  "line-opacity": 0.1
                                }
                              }
                            ]
                          }
                        },
                        {
                          id: "protected-areas",
                          type: "vector",
                          source: {
                            type: "vector",
                            provider: {
                              type: 'carto',
                              options: {
                                account: "wri-01",
                                // api_key: 'añsdlkjfñaklsjdfklñajsdfñlkadjsf',
                                layers: [
                                  {
                                    options: {
                                      cartocss: "#wdpa_protected_areas {  polygon-opacity: 1.0; polygon-fill: #704489 }",
                                      cartocss_version: "2.3.0",
                                      sql: "SELECT * FROM wdpa_protected_areas"
                                    },
                                    type: "cartodb"
                                  }
                                ]
                              }
                            },
                          },
                          render: {
                            layers: [
                              {
                                type: "fill",
                                "source-layer": "layer0",
                                paint: {
                                  'fill-color': '#5ca2d1',
                                  'fill-opacity': 1
                                }
                              },
                              {
                                type: "line",
                                "source-layer": "layer0",
                                paint: {
                                  "line-color": "#000000",
                                  "line-opacity": 0.1
                                }
                              }
                            ]
                          }
                        }
                      ]}
                    />
                  </>
                );
              }}
            </Map>
          }
          position={{ top: true, right: true }}
          column={5}
        >
          <Card
            theme="-tertiary -theme-home"
            letter="B"
            title={this.props.intl.formatMessage({ id: "home.card.b.title" })}
            description={this.props.intl.formatMessage({
              id: "home.card.b.description"
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
            title={this.props.intl.formatMessage({ id: "home.card.c.title" })}
            description={this.props.intl.formatMessage({
              id: "home.card.c.description"
            })}
            link={{
              label: this.props.intl.formatMessage({
                id: "home.card.c.link.label"
              }),
              href: "/observations"
            }}
          />
        </StaticSection>
      </Layout>
    );
  }
}

HomePage.propTypes = {
  intl: intlShape.isRequired
};


export default withTracker(withIntl(HomePage));
