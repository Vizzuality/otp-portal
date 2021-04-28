/* eslint-disable react/prefer-stateless-function */
import React, { Fragment } from 'react';
import PropTypes from 'prop-types';

import isEqual from 'lodash/isEqual';
import debounce from 'lodash/debounce';

import getBBox from '@turf/bbox';

// Redux
import { connect } from 'react-redux';
import {
  setOperatorsDetailMapLocation,
  setOperatorsDetailMapLayersSettings,
  setOperatorsDetailFmu,
  setOperatorsDetailFmuBounds,
  setOperatorsDetailAnalysis,
  setOperatorsDetailMapInteractions,
  setOperatorsDetailMapHoverInteractions,
} from 'modules/operators-detail-fmus';
import {
  getActiveLayers,
  getActiveHoverInteractiveLayers,
  getActiveInteractiveLayersIds,
  getLegendLayers,
  getFMUs,
  getFMU,
  getPopup,
  getHoverPopup,
} from 'selectors/operators-detail/fmus';

// Intl
import { injectIntl, intlShape } from 'react-intl';

// Services
import modal from 'services/modal';

// Components
import Map from 'components/map-new';
import LayerManager from 'components/map-new/layer-manager';
import MapControls from 'components/map/map-controls';
import ZoomControl from 'components/map/controls/zoom-control';
import FAAttributions from 'components/map-new/fa-attributions';

import Sidebar from 'components/ui/sidebar';
import Legend from 'components/map-new/legend';
import Popup from 'components/map-new/popup';

const CERTIFICATIONS = [
  { label: 'FSC', value: 'fsc' },
  { label: 'PEFC', value: 'pefc' },
  { label: 'OLB', value: 'olb' },
  { label: 'FSC-CW', value: 'fsc-cw' },
  { label: 'PAFC', value: 'pafc' },
  { label: 'TLV', value: 'tlv' },
  { label: 'LS', value: 'ls' },
];

class OperatorsDetailFMUs extends React.Component {
  componentDidMount() {
    const { fmus, fmu } = this.props;

    if (fmus.length) {
      this.props.setOperatorsDetailFmu(fmus[0].id);
      this.getBBOX();
    }

    if (fmu) {
      this.props.setOperatorsDetailAnalysis(fmu, 'loss');
      this.props.setOperatorsDetailAnalysis(fmu, 'glad');
    }
  }

  componentDidUpdate(prevProps) {
    const {
      fmus: prevFmus,
      fmu: prevFmu,
      interactions: prevInteractions,
    } = prevProps;
    const { fmus, fmu, interactions } = this.props;

    if (!isEqual(fmus, prevFmus)) {
      this.props.setOperatorsDetailFmu(fmus[0].id);
      this.getBBOX();
    }

    if (fmu.id !== prevFmu.id) {
      this.props.setOperatorsDetailAnalysis(fmu, 'loss');
      this.props.setOperatorsDetailAnalysis(fmu, 'glad');
    }

    if (!isEqual(interactions, prevInteractions)) {
      const { fmusdetail: interactionsFmus } = interactions;
      if (interactionsFmus) {
        this.props.setOperatorsDetailFmu(interactionsFmus.data.id);
      }
    }

    if (
      fmu.loss &&
      prevFmu.loss &&
      (fmu.loss.startDate !== prevFmu.loss.startDate ||
        fmu.loss.trimEndDate !== prevFmu.loss.trimEndDate)
    ) {
      this.props.setOperatorsDetailAnalysis(fmu, 'loss');
    }

    if (
      fmu.glad &&
      prevFmu.glad &&
      (fmu.glad.startDate !== prevFmu.glad.startDate ||
        fmu.glad.trimEndDate !== prevFmu.glad.trimEndDate)
    ) {
      this.props.setOperatorsDetailAnalysis(fmu, 'glad');
    }
  }

  componentWillUnmount() {
    // Attribution listener
    document
      .getElementById('forest-atlas-attribution')
      .removeEventListener('click', this.onCustomAttribute);
  }

  // eslint-disable-next-line class-methods-use-this
  onCustomAttribute(e) {
    e.preventDefault();
    modal.toggleModal(true, {
      children: FAAttributions,
    });
  }

  onClick = (e) => {
    if (
      e.features &&
      e.features.length &&
      !e.target.classList.contains('mapbox-prevent-click')
      ) {
      // No better way to do this
      const { features, lngLat } = e;
      this.props.setOperatorsDetailMapInteractions({ features, lngLat });
    } else {
      this.props.setOperatorsDetailMapInteractions({});
    }
  }

  onHover = (e) => {
    if (e.features && e.features.length) {
      const { features, lngLat } = e;
      this.props.setOperatorsDetailMapHoverInteractions({ features, lngLat });
    } else {
      this.props.setOperatorsDetailMapHoverInteractions({});
    }
  }

  getBBOX() {
    const { fmus } = this.props;

    const bbox = getBBox({
      type: 'FeatureCollection',
      features: fmus.map((f) => f.geojson),
    });

    this.props.setOperatorsDetailFmuBounds({
      bbox,
      options: {
        padding: {
          top: 50,
          bottom: 50,
          left: 350,
          right: 50,
        },
      },
    });
  }

  render() {
    const {
      hoverPopup,
      fmu,
      fmus,
      operatorsDetailFmus,
      activeLayers,
      hoverActiveInteractiveLayers,
      activeInteractiveLayersIds,
      legendLayers,
    } = this.props;

    const certifications = CERTIFICATIONS.filter(
      ({ value }) => fmu[`certification-${value}`]
    ).map((ct) => ct.label);

    return (
      <div className="c-section -map">
        <Sidebar className="-fluid">
          {fmus && !!fmus.length && (
            <div className="c-fmu-card">
              <h3 className="c-title -extrabig -uppercase -proximanova">
                {this.props.intl.formatMessage({ id: 'analysis' })}
              </h3>
              <p>
                {this.props.intl.formatMessage({ id: 'analysis.description' })}
              </p>

              <div className="fmu-select">
                <select
                  value={fmu.id}
                  onChange={(e) => {
                    this.props.setOperatorsDetailFmu(
                      fmus.find(
                        (f) => Number(f.id) === Number(e.currentTarget.value)
                      ).id
                    );
                  }}
                >
                  {fmus.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name}
                    </option>
                  ))}
                </select>

                <div className="fmu-select-value">{fmu.name}</div>
              </div>

              {!!certifications.length && (
                <div className="fmu-certifications">
                  <div className="fmu-certifications-title">
                    {this.props.intl.formatMessage({ id: 'certifications' })}:
                  </div>
                  <div className="fmu-certifications-list">
                    {certifications.join(', ')}
                  </div>
                </div>
              )}
            </div>
          )}

          <Legend
            className="-relative"
            layerGroups={legendLayers}
            sortable={false}
            collapsable={false}
            // expanded={false}
            setLayerSettings={this.props.setOperatorsDetailMapLayersSettings}
          />
        </Sidebar>

        <div className="c-map-container -static">
          {/* Map */}
          <Map
            mapStyle="mapbox://styles/mapbox/light-v9"
            bounds={fmu.bounds}
            // options
            scrollZoom={false}
            // viewport
            viewport={operatorsDetailFmus.map}
            // Interaction
            interactiveLayerIds={activeInteractiveLayersIds}
            onClick={this.onClick}
            onHover={this.onHover}
            onLoad={() => {
              // Attribution listener
              document
                .getElementById('forest-atlas-attribution')
                .addEventListener('click', this.onCustomAttribute);
            }}
            // Options
            transformRequest={(url) => {
              if (url.startsWith(process.env.OTP_API)) {
                return {
                  url,
                  headers: {
                    'Content-Type': 'application/json',
                    'OTP-API-KEY': process.env.OTP_API_KEY,
                  },
                };
              }

              return null;
            }}
            mapOptions={{
              customAttribution:
                '<a id="forest-atlas-attribution" href="http://cod.forest-atlas.org/?l=en" rel="noopener noreferrer" target="_blank">Forest Atlas</a>',
            }}
          >
            {(map) => (
              <Fragment>
                {/* LAYER MANAGER */}
                <LayerManager map={map} layers={activeLayers} />

                <Popup
                  popup={hoverPopup}
                  template="fmus-detail"
                  layers={hoverActiveInteractiveLayers}
                />
              </Fragment>
            )}
          </Map>

          {/* MapControls */}
          <MapControls>
            <ZoomControl
              zoom={operatorsDetailFmus.map.zoom}
              onZoomChange={(zoom) => {
                this.props.setOperatorsDetailMapLocation({
                  ...operatorsDetailFmus.map,
                  zoom,
                  transitionDuration: 500,
                });
              }}
            />
          </MapControls>
        </div>
      </div>
    );
  }
}

OperatorsDetailFMUs.propTypes = {
  intl: intlShape.isRequired,
  interactions: PropTypes.shape({}).isRequired,
  fmus: PropTypes.array.isRequired,
  fmu: PropTypes.shape({}).isRequired,
  operatorsDetailFmus: PropTypes.object.isRequired,
  activeLayers: PropTypes.array,
  hoverPopup: PropTypes.shape({}).isRequired,
  hoverActiveInteractiveLayers: PropTypes.array,
  activeInteractiveLayersIds: PropTypes.array,
  legendLayers: PropTypes.array,

  setOperatorsDetailMapLocation: PropTypes.func,
  setOperatorsDetailMapLayersSettings: PropTypes.func,
  setOperatorsDetailFmu: PropTypes.func,
  setOperatorsDetailFmuBounds: PropTypes.func,
  setOperatorsDetailAnalysis: PropTypes.func,
  setOperatorsDetailMapInteractions: PropTypes.func,
  setOperatorsDetailMapHoverInteractions: PropTypes.func,
};

export default injectIntl(
  connect(
    (state, props) => ({
      operatorsDetailFmus: state.operatorsDetailFmus,
      interactions: state.operatorsDetailFmus.interactions,
      hoverInteractions: state.operatorsDetailFmus.hoverInteractions,
      fmus: getFMUs(state, props),
      fmu: getFMU(state, props),
      popup: getPopup(state, props),
      hoverPopup: getHoverPopup(state, props),
      activeLayers: getActiveLayers(state, props),
      hoverActiveInteractiveLayers: getActiveHoverInteractiveLayers(
        state,
        props
      ),
      activeInteractiveLayersIds: getActiveInteractiveLayersIds(state, props),
      legendLayers: getLegendLayers(state, props),
    }),
    {
      setOperatorsDetailMapLocation,
      setOperatorsDetailMapLayersSettings,
      setOperatorsDetailFmu,
      setOperatorsDetailFmuBounds,
      setOperatorsDetailAnalysis,
      setOperatorsDetailMapInteractions,
      setOperatorsDetailMapHoverInteractions,
    }
  )(OperatorsDetailFMUs)
);
