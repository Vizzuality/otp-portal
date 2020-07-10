import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';

// Redux
import { connect } from 'react-redux';
import {
  setMapLocation,
  unmountMap
} from 'modules/sawmill-map';

// Intl
import { injectIntl, intlShape } from 'react-intl';

// Services
import modal from 'services/modal';
import SawmillsService from 'services/sawmillsService';

// Components
import Field from 'components/form/Field';
import Input from 'components/form/Input';
import Checkbox from 'components/form/Checkbox';
import Spinner from 'components/ui/spinner';
import Map from 'components/map-new';
import LayerManager from 'components/map-new/layer-manager';
import MapControls from 'components/map/map-controls';
import ZoomControl from 'components/map/controls/zoom-control';
import LocationSearch from 'components/map/location-search';

// Constants
const FORM_ELEMENTS = {
  elements: {
  },
  validate() {
    const elements = this.elements;
    Object.keys(elements).forEach((k) => {
      elements[k].validate();
    });
  },
  isValid() {
    const elements = this.elements;
    const valid = Object.keys(elements)
      .map(k => elements[k].isValid())
      .filter(v => v !== null)
      .every(element => element);

    return valid;
  }
};

class SawmillModal extends React.Component {
  static propTypes = {
    user: PropTypes.object,
    sawmill: PropTypes.object,
    intl: intlShape.isRequired,
    sawmillMap: PropTypes.object,
    onChange: PropTypes.func,
    setMapLocation: PropTypes.func,
    unmountMap: PropTypes.func
  };

  constructor(props) {
    super(props);
    this.sawmillsService = new SawmillsService({
      authorization: props.user.token
    });

    const { sawmill } = this.props;
    const emptyFormState = {
      name: '',
      lat: 0,
      lng: 0,
      'is-active': false
    };

    const formState = sawmill || emptyFormState;

    this.state = {
      form: {
        ...formState
      },
      submitting: false,
      errors: [],
      hasMapLayer: false
    };
  }

  componentDidMount() {
    const { sawmill, sawmillMap } = this.props;
    if (sawmill) {
      const { viewport } = sawmillMap;

      this.props.setMapLocation({
        ...viewport,
        latitude: sawmill.lat,
        longitude: sawmill.lng
      });
    }
  }

  componentWillUnmount() {
    this.props.unmountMap();
  }

  // HELPERS
  getBody() {
    const { sawmill } = this.props;
    return {
      data: {
        ...!!sawmill && !!sawmill.id && { id: sawmill.id },
        type: 'sawmills',
        attributes: {
          name: this.state.form.name,
          lat: this.state.form.lat,
          lng: this.state.form.lng,
          'is-active': this.state.form['is-active']
        }
      }
    };
  }

  // UI EVENTS
  handleSubmit(e) {
    e.preventDefault();
    const { sawmill } = this.props;

    // Validate the form
    FORM_ELEMENTS.validate();

    // Set a timeout due to the setState function of react
    setTimeout(() => {
      // Validate all the inputs on the current step
      const valid = FORM_ELEMENTS.isValid(this.state.form);

      if (valid) {
        // Start the submitting
        this.setState({ submitting: true });

        this.sawmillsService.saveSawmill({
          type: (sawmill && sawmill.id) ? 'PATCH' : 'POST',
          id: sawmill && sawmill.id,
          body: this.getBody()
        })
          .then(() => {
            this.setState({ submitting: false, errors: [] });
            this.props.onChange && this.props.onChange();
            modal.toggleModal(false);
          })
          .catch((err) => {
            console.error(err);
            this.setState({ submitting: false, errors: err });
          });
      }
    }, 0);
  }

  handleChange(value) {
    const { sawmillMap } = this.props;
    const { viewport } = sawmillMap;

    const form = Object.assign({}, this.state.form, value);
    this.setState({ form });

    this.props.setMapLocation({
      ...viewport,
      latitude: this.state.form.lat,
      longitude: this.state.form.lng
    });
  }

  setMapLocation = (location) => {
    const { sawmillMap } = this.props;
    const { viewport } = sawmillMap;

    this.props.setMapLocation({
      ...viewport,
      ...location
    });

    const form = Object.assign({}, this.state.form, {
      lat: viewport.latitude,
      lng: viewport.longitude
    });
    this.setState({ form });
  }

  render() {
    const { submitting } = this.state;
    const {
      sawmill,
      sawmillMap
    } = this.props;

    const submittingClassName = classnames({
      '-submitting': submitting
    });

    return (
      <div className="c-login">
        <Spinner isLoading={submitting} className="-light" />
        <h2 className="c-title -extrabig">
          {
          sawmill ? this.props.intl.formatMessage({ id: 'sawmills.modal.title.edit' }) :
            this.props.intl.formatMessage({ id: 'sawmills.modal.title' })
          }
        </h2>
        <form className="c-form" onSubmit={e => this.handleSubmit(e)} noValidate>
          <fieldset className="c-field-container" name="add-sawmill">
            <div className="c-field-row">
              <div className="l-row row -equal-heigth">
                <div className="columns medium-8 small-12">
                  <Field
                    onChange={value => this.handleChange({ name: value })}
                    className="-fluid"
                    validations={['required']}
                    properties={{
                      name: 'name',
                      label: this.props.intl.formatMessage({ id: 'sawmills.modal.name' }),
                      required: true,
                      type: 'text',
                      default: this.state.form.name
                    }}
                  >
                    {Input}
                  </Field>
                </div>
                <div className="columns medium-4 small-12">
                  <Field
                    onChange={value => this.handleChange({ 'is-active': value.checked })}
                    className="-fluid"
                    properties={{
                      name: 'is-active',
                      label: this.props.intl.formatMessage({ id: 'sawmills.modal.active' }),
                      checked: this.state.form['is-active']
                    }}
                  >
                    {Checkbox}
                  </Field>
                </div>
              </div>
            </div>

            <div className={'c-map-container -modal'}>
              <Spinner isLoading={sawmillMap.loading} className="-light" />

              <LocationSearch
                setMapLocation={this.props.setMapLocation}
              />

              {/* Map */}
              <Map
                mapStyle="mapbox://styles/mapbox/light-v9"

                // viewport
                viewport={sawmillMap.viewport}
                onViewportChange={this.setMapLocation}

                onClick={this.onClick}

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

                  return null;
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
                                    coordinates: [sawmillMap.viewport.longitude, sawmillMap.viewport.latitude]
                                  }
                                }
                              ]
                            }
                          },
                          render: {
                            layers: [{
                              type: 'circle',
                              paint: {
                                'circle-color': '#e98300',
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

              <MapControls>
                <ZoomControl
                  zoom={sawmillMap.viewport.zoom}
                  onZoomChange={(zoom) => {
                    this.setMapLocation({
                      zoom,
                      transitionDuration: 500
                    });
                  }}
                />
              </MapControls>
            </div>

            <div className="c-field-row">
              <div className="l-row row -equal-heigth">
                <div className="columns medium-6 small-12">
                  {/* DATE */}
                  <Field
                    onChange={value => this.handleChange({ lat: +value })}
                    className="-fluid"
                    properties={{
                      name: 'lat',
                      label: this.props.intl.formatMessage({ id: 'sawmills.modal.lat' }),
                      type: 'number',
                      default: this.state.form.lat.toFixed(2),
                      value: this.state.form.lat.toFixed(2),
                    }}
                  >
                    {Input}
                  </Field>
                </div>
                <div className="columns medium-6 small-12">
                  {/* DATE */}
                  <Field
                    onChange={value => this.handleChange({ lng: +value })}
                    className="-fluid"
                    properties={{
                      name: 'lng',
                      label: this.props.intl.formatMessage({ id: 'sawmills.modal.lng' }),
                      type: 'number',
                      default: this.state.form.lng.toFixed(2),
                      value: this.state.form.lng.toFixed(2)
                    }}
                  >
                    {Input}
                  </Field>
                </div>
              </div>
            </div>
          </fieldset>

          <ul className="c-field-buttons">
            <li>
              <button
                type="button"
                name="commit"
                className="c-button -primary -expanded"
                onClick={() => modal.toggleModal(false)}
              >
                {this.props.intl.formatMessage({ id: 'cancel' })}
              </button>
            </li>
            <li>
              <button
                type="submit"
                name="commit"
                disabled={submitting}
                className={`c-button -secondary -expanded ${submittingClassName}`}
              >
                {this.props.intl.formatMessage({ id: 'submit' })}
              </button>
            </li>
          </ul>
        </form>
      </div>
    );
  }
}

export default injectIntl(connect(
  state => ({
    user: state.user,
    operatorsDetailFmus: state.operatorsDetailFmus,
    sawmillMap: state.sawmillMap
  }), {
    setMapLocation,
    unmountMap
  }
)(SawmillModal));
