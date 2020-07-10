import React, { Fragment } from 'react';
import debounce from 'lodash/debounce';

import * as Cookies from 'js-cookie';

// Toastr
import { toastr } from 'react-redux-toastr';

// Intl
import withIntl from 'hoc/with-intl';
import { intlShape } from 'react-intl';

// Redux
import { connect } from 'react-redux';

import {
  getOperatorsRanking,
  setOperatorsMapLocation,
  setOperatorsMapInteractions,
  setOperatorsMapHoverInteractions,
  setOperatorsMapLayersActive,
  setOperatorsMapLayersSettings,
  setOperatorsSidebar,
  setOperatorsUrl,
  getOperatorsUrl,
  getGladMaxDate
} from 'modules/operators-ranking';
import { getActiveLayers, getActiveInteractiveLayers, getActiveInteractiveLayersIds, getLegendLayers, getPopup, getTable } from 'selectors/operators-ranking';

import withTracker from 'components/layout/with-tracker';

// Services
import modal from 'services/modal';

// Components
import Layout from 'components/layout/layout';
import Sidebar from 'components/ui/sidebar';
import Map from 'components/map-new';
import LayerManager from 'components/map-new/layer-manager';
import Popup from 'components/map-new/popup';
import Legend from 'components/map-new/legend';
import FAAttributions from 'components/map-new/fa-attributions';

import MapControls from 'components/map/map-controls';
import ZoomControl from 'components/map/controls/zoom-control';

// Operators components
import OperatorsFilters from 'components/operators/filters';
import OperatorsTable from 'components/operators/table';


class OperatorsPage extends React.Component {
  static async getInitialProps({ url, store }) {
    const { operatorsRanking } = store.getState();

    if (!operatorsRanking.layersSettings.glad) {
      await store.dispatch(getGladMaxDate());
    }

    if (!operatorsRanking.data.length) {
      await store.dispatch(getOperatorsRanking());
    }

    return { url };
  }

  /* Component Lifecycle */
  componentDidMount() {
    const { url } = this.props;

    // Set location
    this.props.setOperatorsMapLocation(getOperatorsUrl(url));


    // // Set discalimer
    // if (!Cookies.get('operators.disclaimer')) {
    //   toastr.info(
    //     'Info',
    //     this.props.intl.formatMessage({ id: 'operators.disclaimer' }),
    //     {
    //       className: '-disclaimer',
    //       position: 'bottom-right',
    //       timeOut: 15000,
    //       onCloseButtonClick: () => {
    //         Cookies.set('operators.disclaimer', true);
    //       }
    //     }
    //   );
    // }
  }

  componentWillUnMount() {
    toastr.remove('operators.disclaimer');

    // Attribution listener
    document.getElementById('forest-atlas-attribution').removeEventListener('click', this.onCustomAttribute);
  }

  onClick = (e) => {
    if (e.features && e.features.length && !e.target.classList.contains('mapbox-prevent-click')) { // No better way to do this
      const { features, lngLat } = e;
      this.props.setOperatorsMapInteractions({ features, lngLat });
    } else {
      this.props.setOperatorsMapInteractions({});
    }
  }

  onHover = (e) => {
    if (e.features && e.features.length) {
      const { features, lngLat } = e;
      this.props.setOperatorsMapHoverInteractions({ features, lngLat });
    } else {
      this.props.setOperatorsMapHoverInteractions({});
    }
  }

  setMapLocation = debounce((mapLocation) => {
    this.props.setOperatorsMapLocation(mapLocation);
  }, 500);

  onCustomAttribute = (e) => {
    e.preventDefault();
    modal.toggleModal(true, {
      children: FAAttributions
    });
  }

  render() {
    const {
      url,
      operatorsRanking,
      operatorsTable,
      activeLayers,
      activeInteractiveLayers,
      activeInteractiveLayersIds,
      legendLayers,
      popup,
      setOperatorsSidebar
    } = this.props;

    const { open } = operatorsRanking.sidebar;

    return (
      <Layout
        title="Operators"
        description="Operators description..."
        url={url}
        className="-fullscreen"
        footer={false}
      >
        <div className="c-section -map">
          <Sidebar
            open={open}
            name={this.props.intl.formatMessage({ id: 'transparency_ranking' })}
            onToggle={(o) => {
              setOperatorsSidebar({ open: o });
            }}
          >
            <OperatorsFilters />
            <OperatorsTable operators={operatorsRanking.data} operatorsTable={operatorsTable} />
          </Sidebar>

          <div className="c-map-container -absolute" style={{ width: `calc(100% - ${open ? 700 : 50}px)`, left: open ? 700 : 50 }}>
            {/* Map */}
            <Map
              mapStyle="mapbox://styles/mapbox/light-v9"

              // viewport
              viewport={operatorsRanking.map}
              onViewportChange={this.setMapLocation}

              // Interaction
              interactiveLayerIds={activeInteractiveLayersIds}
              onClick={this.onClick}
              onHover={this.onHover}

              onLoad={() => {
                // Attribution listener
                document.getElementById('forest-atlas-attribution').addEventListener('click', this.onCustomAttribute);
              }}

              mapOptions={{
                customAttribution: '<a id="forest-atlas-attribution" href="http://cod.forest-atlas.org/?l=en" rel="noopener noreferrer" target="_blank">Forest Atlas</a>'
              }}

              // Options
              transformRequest={(url, resourceType) => {
                if (url.startsWith(process.env.OTP_API)) {
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
                  <Popup
                    popup={popup}
                    template="fmus"
                    layers={activeInteractiveLayers}
                    onClose={() => this.props.setOperatorsMapInteractions({})}
                  />
                  {/* LAYER MANAGER */}
                  <LayerManager
                    map={map}
                    layers={activeLayers}
                  />
                </Fragment>
              )}
            </Map>

            <Legend
              layerGroups={legendLayers}
              sortable={false}
              expanded={false}
              setLayerSettings={this.props.setOperatorsMapLayersSettings}
            />

            {/* MapControls */}
            <MapControls>
              <ZoomControl
                zoom={operatorsRanking.map.zoom}
                onZoomChange={(zoom) => {
                  this.props.setOperatorsMapLocation({
                    ...operatorsRanking.map,
                    zoom,
                    transitionDuration: 500
                  });
                }}
              />
            </MapControls>
          </div>
        </div>
      </Layout>
    );
  }
}

OperatorsPage.propTypes = {
  intl: intlShape.isRequired
};


export default withTracker(withIntl(connect(

  (state, props) => ({
    operatorsRanking: state.operatorsRanking,
    activeLayers: getActiveLayers(state, props),
    activeInteractiveLayers: getActiveInteractiveLayers(state, props),
    activeInteractiveLayersIds: getActiveInteractiveLayersIds(state, props),
    legendLayers: getLegendLayers(state, props),
    popup: getPopup(state, props),
    operatorsTable: getTable(state, props)
  }),
  dispatch => ({
    getOperatorsRanking() {
      dispatch(getOperatorsRanking());
    },
    setOperatorsMapLocation(mapLocation) {
      dispatch(setOperatorsMapLocation(mapLocation));
      dispatch(setOperatorsUrl(mapLocation));
    },
    setOperatorsMapInteractions(obj) {
      dispatch(setOperatorsMapInteractions(obj));
    },
    setOperatorsMapHoverInteractions(obj) {
      dispatch(setOperatorsMapHoverInteractions(obj));
    },
    setOperatorsMapLayersActive(obj) {
      dispatch(setOperatorsMapLayersActive(obj));
    },
    setOperatorsMapLayersSettings(obj) {
      dispatch(setOperatorsMapLayersSettings(obj));
    },
    setOperatorsSidebar(obj) {
      dispatch(setOperatorsSidebar(obj));
    }
  })
)(OperatorsPage)));
