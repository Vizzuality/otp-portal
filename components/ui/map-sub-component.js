import React, { Fragment } from 'react';
import PropTypes from 'prop-types';

// Components
import Map from 'components/map-new';
import LayerManager from 'components/map-new/layer-manager';

import Spinner from 'components/ui/spinner';

// Constants
import { PALETTE_COLOR_1 } from 'constants/rechart';


class MapSubComponent extends React.Component {
  static propTypes = {
    id: PropTypes.string,
    location: PropTypes.object,
    level: PropTypes.number
  };

  state = {
    loading: true
  }

  render() {
    const { id, location, level } = this.props;

    const color = PALETTE_COLOR_1[level] ? `${PALETTE_COLOR_1[level].fill}` : '#000';

    return (
      <div className="c-map-sub-component" key={`subcomponent-${id}`}>
        { !!location &&
          <div
            className="c-map-container -table"
            ref={(map) => { this.mapContainer = map; }}
          >
            <Spinner isLoading={this.state.loading} className="-light" />

            {/* Map */}
            <Map
              mapStyle="mapbox://styles/mapbox/light-v9"

              // options
              scrollZoom={false}

              // viewport
              viewport={{
                zoom: 3,
                longitude: location.lng,
                latitude: location.lat
              }}
              onViewportChange={this.setMapocation}

              // Options
              transformRequest={(url, resourceType) => {
                if (
                  resourceType === 'Source' &&
                  url.startsWith(process.env.OTP_API)
                ) {
                  return {
                    url,
                    headers: {
                      'Content-Type': 'application/json',
                      'OTP-API-KEY': process.env.OTP_API_KEY
                    }
                  };
                }
              }}
            >
              {map => (
                <Fragment>
                  {/* LAYER MANAGER */}
                  <LayerManager
                    map={map}
                    layers={[
                      {
                        id: 'observation',
                        type: 'geojson',
                        source: {
                          type: 'geojson',
                          data: {
                            type: 'FeatureCollection',
                            features: [
                              {
                                type: 'Feature',
                                geometry: {
                                  type: 'Point',
                                  coordinates: [location.lng, location.lat]
                                }
                              }
                            ]
                          }
                        },
                        render: {
                          layers: [{
                            type: 'circle',
                            paint: {
                              'circle-color': color,
                              'circle-radius': 10
                            }
                          }]
                        }
                      }
                    ]}
                  />
                </Fragment>
              )}
            </Map>
          </div>
        }
        { !location &&
          <p>This observation has no location.</p>
        }
      </div>
    );
  }
}


export default MapSubComponent;

