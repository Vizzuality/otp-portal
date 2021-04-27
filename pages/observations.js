import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import isEmpty from 'lodash/isEmpty';
import isEqual from 'lodash/isEqual';
import orderBy from 'lodash/orderBy';
import difference from 'lodash/difference';
import debounce from 'lodash/debounce';

// Redux
import { connect } from 'react-redux';

import withTracker from 'components/layout/with-tracker';

// Services
import modal from 'services/modal';

// Intl
import withIntl from 'hoc/with-intl';
import { intlShape } from 'react-intl';

// Selectors
import { getParsedTableObservations } from 'selectors/observations/parsed-table-observations';
import { getParsedChartObservations } from 'selectors/observations/parsed-chart-observations';
import {
  getObservationsLayers,
  getObservationsLegend,
} from 'selectors/observations/parsed-map-observations';
import { getParsedFilters } from 'selectors/observations/parsed-filters';

// Components
import Layout from 'components/layout/layout';
import Overview from 'components/observations/overview';
import CheckboxGroup from 'components/form/CheckboxGroup';
import StaticHeader from 'components/ui/static-header';
import Table from 'components/ui/table';
import Filters from 'components/ui/observation-filters';
import Spinner from 'components/ui/spinner';
import MapSubComponent from 'components/ui/map-sub-component';
import StaticTabs from 'components/ui/static-tabs';

import Map from 'components/map-new';
import LayerManager from 'components/map-new/layer-manager';
import Legend from 'components/map-new/legend';
import MapControls from 'components/map/map-controls';
import ZoomControl from 'components/map/controls/zoom-control';
import FAAttributions from 'components/map-new/fa-attributions';

// Modules
import {
  getObservations,
  getFilters,
  setFilters,
  getObservationsUrl,
  setActiveColumns,
  setObservationsMapLocation,
  setObservationsMapCluster,
} from 'modules/observations';

import { logEvent } from 'utils/analytics';

// Constants
import { FILTERS_REFS } from 'constants/observations';
import {
  tableCheckboxes,
  getColumnHeaders,
} from 'constants/observations-column-headers';

class ObservationsPage extends React.Component {
  static async getInitialProps({ url, store }) {
    const { observations } = store.getState();

    if (isEmpty(observations.data)) {
      await store.dispatch(getObservations());
    }

    if (isEmpty(observations.filters.options)) {
      await store.dispatch(getFilters());
    }

    return { url };
  }

  constructor(props) {
    super(props);

    this.state = {
      tab: this.props.url.query.subtab || 'observations-list',
      page: 1,
    };

    this.triggerChangeTab = this.triggerChangeTab.bind(this);
  }

  componentDidMount() {
    const { url } = this.props;

    this.props.getObservationsUrl(url);
  }

  componentWillReceiveProps(nextProps) {
    if (!isEqual(this.props.parsedFilters.data, nextProps.parsedFilters.data)) {
      this.props.getObservations();
    }
  }

  onPageChange(page) {
    this.setState({ page: page + 1 }, () => {
      this.props.getObservations(page + 1);
    });
  }

  getPageSize() {
    const { observations } = this.props;

    if (observations.data.length) {
      // What if the page only have 5 results...
      return observations.data.length > 50 ? 50 : observations.data.length;
    }

    return 1;
  }

  onCustomAttribute = (e) => {
    e.preventDefault();
    modal.toggleModal(true, {
      children: FAAttributions,
    });
  };

  setActiveColumns(value) {
    const { observations } = this.props;
    const addColumn = difference(value, observations.columns);
    const removeColumn = difference(observations.columns, value);

    if (addColumn.length) logEvent('Observations', 'Add Column', addColumn[0]);
    if (removeColumn.length)
      logEvent('Observations', 'Remove Column', removeColumn[0]);

    this.props.setActiveColumns(value);
  }

  triggerChangeTab(tab) {
    this.setState({ tab });
  }

  setMapLocation = debounce((mapLocation) => {
    this.props.setObservationsMapLocation(mapLocation);
  }, 500);

  onViewportChange = (mapLocation) => {
    this.props.setObservationsMapCluster({});
    this.setMapLocation(mapLocation);
  };

  onClick = (e) => {
    const { cluster: clusterProp } = this.props.observations;

    const { features } = e;
    if (features && features.length) {
      const { source, geometry, properties } = features[0];
      const { cluster, cluster_id: clusterId, point_count } = properties;

      if (cluster && +clusterId !== +clusterProp.id) {
        const layers = this.map
          .getStyle()
          .layers.filter((l) => l.source === source);

        this.map
          .getSource(source)
          .getClusterLeaves(clusterId, point_count, 0, (error, fts) => {
            if (error) {
              this.props.setObservationsMapCluster({});
              return true;
            }

            this.props.setObservationsMapCluster({
              id: clusterId,
              coordinates: geometry.coordinates,
              features: orderBy(fts, 'properties.level'),
              layers,
            });

            return fts;
          });
      } else {
        this.props.setObservationsMapCluster({});
      }
    } else {
      this.props.setObservationsMapCluster({});
    }
  };

  // onHover = (e) => {
  //   const { features } = e;
  //   if (features) {
  //     console.log(features);
  //   }
  // }

  render() {
    const {
      url,
      observations,
      getObservationsLayers,
      getObservationsLegend,
      parsedFilters,
      parsedTableObservations,
      parsedChartObservations,
    } = this.props;

    const changeOfLabelLookup = {
      level: 'severity',
      observation: 'detail',
    };

    const columnHeaders = getColumnHeaders(this.props.intl);
    const inputs = tableCheckboxes;

    const tableOptions = inputs.map((column) => ({
      label: Object.keys(changeOfLabelLookup).includes(column)
        ? this.props.intl.formatMessage({ id: changeOfLabelLookup[column] })
        : this.props.intl.formatMessage({ id: column }),
      value: column,
    }));

    return (
      <Layout
        title="Observations"
        description="Observations description..."
        url={url}
      >
        <StaticHeader
          title={this.props.intl.formatMessage({ id: 'observations' })}
          background="/static/images/static-header/bg-observations.jpg"
          className="-short"
        />

        <div className="c-section">
          <div className="l-container">
            <div className="row l-row">
              <div className="columns small-12 medium-4">
                <Filters
                  options={parsedFilters.options}
                  filters={parsedFilters.data}
                  setFilters={this.props.setFilters}
                  filtersRefs={FILTERS_REFS}
                />
              </div>

              <div className="columns small-12 medium-6 medium-offset-1">
                {/* Overview by category graphs */}
                <Overview parsedObservations={parsedChartObservations} />
              </div>
            </div>
          </div>
        </div>

        <StaticTabs
          options={[
            {
              label: this.props.intl.formatMessage({
                id: 'observations.tab.observations-list',
              }),
              value: 'observations-list',
            },
            {
              label: this.props.intl.formatMessage({
                id: 'observations.tab.map',
              }),
              value: 'map-view',
            },
          ]}
          defaultSelected={this.state.tab}
          onChange={this.triggerChangeTab}
        />

        {this.state.tab === 'observations-list' && (
          <section className="c-section -relative">
            <div className="l-container">
              <h2 className="c-title">
                {this.props.intl.formatMessage({
                  id: 'observations.tab.observations-list',
                })}
              </h2>
              <Spinner isLoading={observations.loading} />
              <div className="c-field -fluid -valid">
                <CheckboxGroup
                  className="-single-row -small -secondary"
                  name="observations-columns"
                  onChange={(value) => this.setActiveColumns(value)}
                  properties={{
                    default: observations.columns,
                    name: 'observations-columns',
                  }}
                  options={tableOptions}
                />
              </div>

              <Table
                sortable
                data={parsedTableObservations}
                options={{
                  columns: columnHeaders.filter((header) =>
                    observations.columns.includes(header.accessor)
                  ),
                  pageSize: this.getPageSize(),
                  pagination: true,
                  previousText: '<',
                  nextText: '>',
                  noDataText: 'No rows found',
                  showPageSizeOptions: false,
                  // Api pagination & sort
                  // pages: observations.totalSize,
                  // page: this.state.page - 1,
                  // manual: true
                  onPageChange: (page) => this.onPageChange(page),
                  defaultSorted: [
                    {
                      id: 'date',
                      desc: false,
                    },
                  ],
                  showSubComponent: observations.columns.includes('location'),
                  subComponent: (row) =>
                    observations.columns.includes('location') && (
                      <MapSubComponent
                        id={row.original.id}
                        location={row.original.location}
                        level={row.original.level}
                      />
                    ),
                }}
              />
            </div>
          </section>
        )}

        {this.state.tab === 'map-view' && (
          <div className="c-map-container -static">
            {/* Map */}
            <Map
              mapStyle="mapbox://styles/mapbox/light-v9"
              // options
              scrollZoom={false}
              // viewport
              viewport={observations.map}
              onViewportChange={this.onViewportChange}
              // Interaction
              interactiveLayerIds={[
                'observations-circle-0',
                'observations-symbol-1',
                'observations-circle-2',
              ]}
              onClick={this.onClick}
              onHover={this.onHover}
              onLoad={({ map }) => {
                this.map = map;

                // Attribution listener
                document
                  .getElementById('forest-atlas-attribution')
                  .addEventListener('click', this.onCustomAttribute);
              }}
              onUnmount={() => (this.map = null)}
              // Options
              transformRequest={(url, resourceType) => {
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
                  <LayerManager map={map} layers={getObservationsLayers} />
                </Fragment>
              )}
            </Map>

            {/* LEGEND */}
            <Legend
              layerGroups={getObservationsLegend}
              collapsable={false}
              sortable={false}
              toolbar={<></>}
              setLayerSettings={() => {}}
            />

            {/* MapControls */}
            <MapControls>
              <ZoomControl
                zoom={observations.map.zoom}
                onZoomChange={(zoom) => {
                  this.props.setObservationsMapLocation({
                    ...observations.map,
                    zoom,
                    transitionDuration: 500,
                  });
                }}
              />
            </MapControls>
          </div>
        )}
      </Layout>
    );
  }
}

ObservationsPage.propTypes = {
  url: PropTypes.shape({}).isRequired,
  observations: PropTypes.object,
  intl: intlShape.isRequired,
  parsedFilters: PropTypes.object,
  getObservationsLayers: PropTypes.array,
  parsedChartObservations: PropTypes.array,
  parsedTableObservations: PropTypes.array,

  getObservations: PropTypes.func.isRequired,
  getObservationsUrl: PropTypes.func.isRequired,
  setActiveColumns: PropTypes.func.isRequired,
  setFilters: PropTypes.func.isRequired,
  setObservationsMapLocation: PropTypes.func.isRequired,
  setObservationsMapCluster: PropTypes.func.isRequired,
};

export default withTracker(
  withIntl(
    connect(
      (state, props) => ({
        observations: state.observations,
        parsedFilters: getParsedFilters(state),
        parsedTableObservations: getParsedTableObservations(state),
        parsedChartObservations: getParsedChartObservations(state),
        getObservationsLayers: getObservationsLayers(state),
        getObservationsLegend: getObservationsLegend(state, props),
      }),
      {
        getObservations,
        getFilters,
        getObservationsUrl,
        setObservationsMapLocation,
        setObservationsMapCluster,
        setFilters,
        setActiveColumns,
      }
    )(ObservationsPage)
  )
);
