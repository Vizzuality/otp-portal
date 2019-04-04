import React from 'react';
import debounce from 'lodash/debounce';
import sortBy from 'lodash/sortBy';
import flatten from 'lodash/flatten';

import * as Cookies from 'js-cookie';

// Next
import Link from 'next/link';

// Toastr
import { toastr } from 'react-redux-toastr';

// Intl
import withIntl from 'hoc/with-intl';
import { intlShape } from 'react-intl';

// Utils
import { HELPERS_DOC } from 'utils/documentation';

// Redux
import withRedux from 'next-redux-wrapper';
import { store } from 'store';
import { getOperators, setActiveMapLayers } from 'modules/operators';
import { getOperatorsRanking, setOperatorsMapLocation, setOperatorsUrl, getOperatorsUrl } from 'modules/operators-ranking';
import withTracker from 'components/layout/with-tracker';

// Constants
import { MAP_LAYERS_OPERATORS } from 'constants/operators';

// Components
import Page from 'components/layout/page';
import Layout from 'components/layout/layout';
import Sidebar from 'components/ui/sidebar';
import Spinner from 'components/ui/spinner';
import Icon from 'components/ui/icon';
import Map from 'components/map/map';
import MapLegend from 'components/map/map-legend';
import MapControls from 'components/map/map-controls';
import ZoomControl from 'components/map/controls/zoom-control';

// Operators components
import OperatorsRanking from 'components/operators/ranking';
import OperatorsFilters from 'components/operators/filters';
import OperatorsCertificationsTd from 'components/operators/certificationsTd';


class OperatorsPage extends Page {

  static parseData(operators = []) {
    return {
      sortColumn: 'documentation',
      sortDirection: -1,
      table: operators.map(o => ({
        id: o.id,
        name: o.name,
        certification: <OperatorsCertificationsTd fmus={o.fmus} />,
        score: o.score || 0,
        obs_per_visit: o['obs-per-visit'] || 0,
        documentation: HELPERS_DOC.getPercentage(o),
        fmus: (o.fmus) ? o.fmus.length : 0
      })),
      max: Math.max(...operators.map(o => o.observations.length))
    };
  }

  constructor(props) {
    super(props);

    this.state = {
      ...OperatorsPage.parseData(props.operatorsRanking.data)
    };
  }

  /* Component Lifecycle */
  componentDidMount() {
    const { url, operators, operatorsRanking } = this.props;

    // Get search operators data
    if (!operators.data.length) {
      // Get operators
      this.props.getOperators();
    }

    if (!operatorsRanking.data.length) {
      // Get operators
      this.props.getOperatorsRanking();
    }

    // Set location
    this.props.setOperatorsMapLocation(getOperatorsUrl(url));

    // Set discalimer
    if (!Cookies.get('operators.disclaimer')) {
      toastr.info(
        'Info',
        this.props.intl.formatMessage({ id: 'operators.disclaimer' }),
        {
          className: '-disclaimer',
          position: 'bottom-right',
          timeOut: 15000,
          onCloseButtonClick: () => {
            Cookies.set('operators.disclaimer', true);
          }
        }
      );
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.operatorsRanking.data.length !== this.props.operatorsRanking.data.length) {
      this.setState(OperatorsPage.parseData(nextProps.operatorsRanking.data));
    }
  }

  componentWillUnMount() {
    toastr.remove('operators.disclaimer');
  }

  /**
   * UI EVENTS
   * - sortBy
  */
  sortBy = (column) => {
    this.setState({
      sortColumn: column,
      sortDirection: this.state.sortDirection * -1
    });
  }

  toggleLayers = (id, checked) => {
    const { activeLayers } = this.props.operators.map;

    const toggledLayers = checked ?
      [...activeLayers, id] : activeLayers.filter(layerId => layerId !== id);

    this.props.setActiveMapLayers(toggledLayers);
  }

  /**
   * HELPERS
   * - getOperatorsTable
   * - getOperatorsRanking
  */
  getOperatorsTable() {
    const operatorsRanking = this.props.operatorsRanking;
    const { sortColumn, sortDirection, table } = this.state;

    if (!operatorsRanking.loading) {
      return (
        <div className="c-ranking">
          <table>
            <thead>
              <tr>
                <th />
                <th
                  className="td-documentation -ta-center -sort"
                  onClick={() => { this.sortBy('documentation'); }}
                >
                  {this.props.intl.formatMessage({ id: 'operators.table.upload_docs' })}
                  {sortDirection === -1 && <Icon name="icon-arrow-down" className="-tiny" />}
                  {sortDirection === 1 && <Icon name="icon-arrow-up" className="-tiny" />}
                </th>
                <th className="-ta-left">
                  {this.props.intl.formatMessage({ id: 'operators.table.name' })}
                </th>

                {/* Other styles */}
                <th className="-ta-center -break-ponit -contextual">
                  {this.props.intl.formatMessage({ id: 'operators.table.obs_visit' })}
                </th>
                <th className="-contextual">
                  {this.props.intl.formatMessage({ id: 'operators.table.fmus' })}
                </th>
                <th className="-contextual">
                  {this.props.intl.formatMessage({ id: 'operators.table.certification' })}
                </th>
              </tr>
            </thead>

            <tbody>
              {sortBy(table, o => sortDirection * o[sortColumn]).map((r, i) => (
                <tr key={r.id}>
                  {i === 0 &&
                  <td className="-ta-center" rowSpan={table.length}>
                    <OperatorsRanking
                      key={`update-${r.id}`}
                      data={table.map(o => ({ id: o.id, value: parseInt(o.documentation, 10) }))}
                      sortDirection={sortDirection}
                    />
                  </td>
                    }
                  <td
                    id={`td-documentation-${r.id}`}
                    className="td-documentation -ta-left"
                  >
                    {r.documentation}%
                    </td>
                  <td className="-ta-left">
                    <Link
                      href={{ pathname: '/operators-detail', query: { id: r.id } }}
                      as={`/operators/${r.id}`}
                    >
                      <a>{r.name}</a>
                    </Link>
                  </td>
                  <td className="-ta-center">
                    {!!r.obs_per_visit && r.obs_per_visit}
                    {!r.obs_per_visit &&
                    <div className="stoplight-dot -state-0}" />
                      }
                  </td>
                  <td className="-ta-right"> {r.fmus} </td>
                  <td className="-ta-right">
                    {r.certification}
                  </td>
                </tr>
                ))}
            </tbody>
          </table>
        </div>
      );
    }
    return <Spinner isLoading />;
  }

  render() {
    const { url, operators, operatorsRanking } = this.props;
    const { activeLayers } = operators.map;


    const mapLayers = MAP_LAYERS_OPERATORS.filter(layer => activeLayers.includes(layer.id));

    // Country filters
    const countryOptions = operatorsRanking.filters.options.country.map(country => country.value);
    const activeCountryIds = operatorsRanking.filters.data.country || [];

    return (
      <Layout
        title="Operators"
        description="Operators description..."
        url={url}
        className="-fullscreen"
        footer={false}
        searchList={operators.data}
      >
        <div className="c-section -map">
          <Sidebar>
            <OperatorsFilters />
            {this.getOperatorsTable()}
          </Sidebar>

          <div className="c-map-container">
            {/* Map */}
            <Map
              mapFilters={{
                COUNTRY_IDS: (activeCountryIds.length) ? activeCountryIds : countryOptions
              }}
              mapOptions={operatorsRanking.map}
              mapListeners={{
                moveend: debounce((map) => {
                  this.props.setOperatorsMapLocation({
                    zoom: map.getZoom(),
                    center: map.getCenter()
                  });
                }, 100)
              }}
              layers={mapLayers}
            />
            {console.log(flatten(MAP_LAYERS_OPERATORS.map(layer =>
              layer.layers.filter(l => l.legendConfig)
            )))}
            <MapLegend
              layers={flatten(MAP_LAYERS_OPERATORS.map(layer =>
                layer.layers.filter(l => l.legendConfig)
              ))}
              toggleLayers={this.toggleLayers}
              activeLayers={activeLayers}
            />

            {/* MapControls */}
            <MapControls>
              <ZoomControl
                zoom={operatorsRanking.map.zoom}
                onZoomChange={(zoom) => {
                  this.props.setOperatorsMapLocation({
                    ...{ zoom }
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


export default withTracker(withIntl(withRedux(
  store,
  state => ({
    operators: state.operators,
    operatorsRanking: state.operatorsRanking
  }),
  dispatch => ({
    getOperators() {
      dispatch(getOperators());
    },
    getOperatorsRanking() {
      dispatch(getOperatorsRanking());
    },
    setOperatorsMapLocation(mapLocation) {
      dispatch(setOperatorsMapLocation(mapLocation));
      dispatch(setOperatorsUrl());
    },
    setActiveMapLayers(activeLayers) {
      dispatch(setActiveMapLayers(activeLayers));
    }
  })
)(OperatorsPage)));
