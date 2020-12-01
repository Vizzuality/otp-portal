import React from 'react';
import PropTypes from 'prop-types';
import isEmpty from 'lodash/isEmpty';
import isEqual from 'lodash/isEqual';
import difference from 'lodash/difference';

// Redux
import { connect } from 'react-redux';

import withTracker from 'components/layout/with-tracker';

// Intl
import withIntl from 'hoc/with-intl';
import { intlShape } from 'react-intl';

// Selectors
import { getParsedChartObservations } from 'selectors/observations/parsed-chart-observations';
import { getParsedTableObservations } from 'selectors/observations/parsed-table-observations';
import { getObservationsLayers } from 'selectors/observations/parsed-map-observations';
import { getParsedFilters } from 'selectors/observations/parsed-filters';

// Components
import Tooltip from 'rc-tooltip/dist/rc-tooltip';
import Layout from 'components/layout/layout';
import CheckboxGroup from 'components/form/CheckboxGroup';
import StaticHeader from 'components/ui/static-header';
import Table from 'components/ui/table';
import Filters from 'components/ui/filters';
import Spinner from 'components/ui/spinner';
import ReadMore from 'components/ui/read-more';
import Icon from 'components/ui/icon';
import MapSubComponent from 'components/ui/map-sub-component';
import StaticTabs from 'components/ui/static-tabs';

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
import { PALETTE_COLOR_1 } from 'constants/rechart';

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

  render() {
    const {
      url,
      observations,
      parsedFilters,
      parsedTableObservations,
    } = this.props;

    // Hard coded values
    const inputs = [
      'date',
      'status',
      'country',
      'operator',
      'fmu',
      'category',
      'observation',
      'level',
      'report',
      'evidence',
      'litigation-status',
      'location',
      'location-accuracy',
      'observer-organizations',
      'observer-types',
      'operator-type',
      'subcategory',
      'relevant-operators',
    ];

    const changeOfLabelLookup = {
      level: 'severity',
      observation: 'detail',
    };

    const tableOptions = inputs.map((column) => ({
      label: Object.keys(changeOfLabelLookup).includes(column)
        ? this.props.intl.formatMessage({ id: changeOfLabelLookup[column] })
        : this.props.intl.formatMessage({ id: column }),
      value: column,
    }));

    const columnHeaders = [
      {
        Header: (
          <span className="sortable">
            {this.props.intl.formatMessage({ id: 'date' })}
          </span>
        ),
        accessor: 'date',
        minWidth: 75,
      },
      {
        Header: (
          <span className="sortable">
            {this.props.intl.formatMessage({ id: 'status' })}
          </span>
        ),
        accessor: 'status',
        minWidth: 150,
        className: 'status',
        Cell: (attr) => (
          <span>
            {this.props.intl.formatMessage({
              id: `observations.status-${attr.value}`,
            })}

            {[7, 8, 9].includes(attr.value) && (
              <Tooltip
                placement="bottom"
                overlay={
                  <div style={{ maxWidth: 200 }}>
                    {this.props.intl.formatMessage({
                      id: `observations.status-${attr.value}.info`,
                    })}
                  </div>
                }
                overlayClassName="c-tooltip no-pointer-events"
              >
                <button className="c-button -icon -primary">
                  <Icon name="icon-info" className="-smaller" />
                </button>
              </Tooltip>
            )}
          </span>
        ),
      },
      {
        Header: (
          <span className="sortable">
            {this.props.intl.formatMessage({ id: 'country' })}
          </span>
        ),
        accessor: 'country',
        className: '-uppercase',
        minWidth: 100,
      },
      {
        Header: (
          <span className="sortable">
            {this.props.intl.formatMessage({ id: 'operator' })}
          </span>
        ),
        accessor: 'operator',
        className: '-uppercase description',
        minWidth: 120,
      },
      {
        Header: (
          <span className="sortable">
            {this.props.intl.formatMessage({ id: 'fmu' })}
          </span>
        ),
        accessor: 'fmu',
        className: 'description',
        minWidth: 120,
      },
      {
        Header: (
          <span className="sortable">
            {this.props.intl.formatMessage({ id: 'category' })}
          </span>
        ),
        accessor: 'category',
        headerClassName: '-a-left',
        className: 'description',
        minWidth: 120,
      },

      {
        Header: (
          <span className="sortable">
            {this.props.intl.formatMessage({ id: 'observer-types' })}
          </span>
        ),
        accessor: 'observer-types',
        headerClassName: '-a-left',
        className: 'observer-types',
        minWidth: 250,
        Cell: (attr) => (
          <ul className="cell-list">
            {attr.value.map((type, i) => (
              <li key={`${type}-${i}`}>
                {this.props.intl.formatMessage({ id: `${type}` })}
              </li>
            ))}
          </ul>
        ),
      },
      {
        Header: (
          <span className="sortable">
            {this.props.intl.formatMessage({ id: 'observer-organizations' })}
          </span>
        ),
        accessor: 'observer-organizations',
        headerClassName: '-a-left',
        className: 'observer-organizations',
        minWidth: 250,
        Cell: (attr) => (
          <ul className="cell-list">
            {attr.value.map((observer) => {
              return <li>{observer.name || observer.organization}</li>;
            })}
          </ul>
        ),
      },
      {
        Header: (
          <span className="sortable">
            {this.props.intl.formatMessage({ id: 'operator-type' })}
          </span>
        ),
        accessor: 'operator-type',
        headerClassName: '-a-left',
        className: 'operator-type',
        minWidth: 250,
        Cell: (attr) =>
          attr.value && (
            <span>
              {this.props.intl.formatMessage({ id: `${attr.value}` })}
            </span>
          ),
      },
      {
        Header: (
          <span className="sortable">
            {this.props.intl.formatMessage({ id: 'subcategory' })}
          </span>
        ),
        accessor: 'subcategory',
        headerClassName: '-a-left',
        className: 'subcategory description',
        minWidth: 250,
      },
      {
        Header: (
          <span className="sortable">
            {this.props.intl.formatMessage({ id: 'evidence' })}
          </span>
        ),
        accessor: 'evidence',
        headerClassName: '-a-left',
        className: 'evidence description',
        minWidth: 250,
        Cell: (attr) => (
          <div className="evidence-item-wrapper">
            {Array.isArray(attr.value) &&
              attr.value.map((v) => (
                <a
                  href={v.attachment.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="evidence-item"
                >
                  <Icon className="" name="icon-file-empty" />
                </a>
              ))}

            {!Array.isArray(attr.value) && (
              <span className="evidence-item-text">{attr.value}</span>
            )}
          </div>
        ),
      },
      {
        Header: (
          <span className="sortable">
            {this.props.intl.formatMessage({ id: 'litigation-status' })}
          </span>
        ),
        accessor: 'litigation-status',
        headerClassName: '-a-left',
        className: 'litigation-status',
        minWidth: 250,
      },
      {
        Header: (
          <span className="sortable">
            {this.props.intl.formatMessage({ id: 'detail' })}
          </span>
        ),
        accessor: 'observation',
        headerClassName: '-a-left',
        className: 'description',
        minWidth: 200,
        Cell: (attr) => (
          <ReadMore
            lines={2}
            more={this.props.intl.formatMessage({ id: 'Read more' })}
            less={this.props.intl.formatMessage({ id: 'Show less' })}
          >
            {attr.value}
          </ReadMore>
        ),
      },
      {
        Header: (
          <span className="sortable">
            {this.props.intl.formatMessage({ id: 'severity' })}
          </span>
        ),
        accessor: 'level',
        headerClassName: 'severity-th',
        className: 'severity',
        Cell: (attr) => {
          return (
            <span
              className={`severity-item -sev-${attr.value}`}
              style={{ color: PALETTE_COLOR_1[+attr.value].fill }}
            >
              {attr.value}
            </span>
          );
        },
      },
      {
        Header: (
          <span className="sortable">
            {this.props.intl.formatMessage({ id: 'report' })}
          </span>
        ),
        accessor: 'report',
        headerClassName: '',
        className: 'report',
        Cell: (attr) => (
          <div className="report-item-wrapper">
            {attr.value ? (
              <a
                href={attr.value}
                target="_blank"
                rel="noopener noreferrer"
                className="report-item"
              >
                <Icon className="" name="icon-file-empty" />
              </a>
            ) : (
              <span className="report-item-text">-</span>
            )}
          </div>
        ),
      },
      {
        Header: (
          <span className="sortable">
            {this.props.intl.formatMessage({ id: 'location-accuracy' })}
          </span>
        ),
        accessor: 'location-accuracy',
        headerClassName: '-a-left',
        className: 'location-accuracy',
        minWidth: 250,
      },
      {
        Header: '',
        accessor: 'location',
        headerClassName: '',
        className: 'location',
        expander: true,
        Expander: ({ isExpanded }) => (
          <div className="location-item-wrapper">
            {isExpanded ? (
              <button className="c-button -small -secondary">
                <Icon name="icon-cross" />
              </button>
            ) : (
              <button className="c-button -small -primary">
                <Icon name="icon-location" />
              </button>
            )}
          </div>
        ),
      },
      {
        Header: (
          <span className="sortable">
            {this.props.intl.formatMessage({ id: 'relevant-operators' })}
          </span>
        ),
        accessor: 'relevant-operators',
        headerClassName: '-a-left',
        className: 'relevant-operators',
        minWidth: 250,
        Cell: (attr) => (
          <ul className="cell-list">
            {attr.value.map((operator) => (
              <li>{operator}</li>
            ))}
          </ul>
        ),
      },
    ];

    return (
      <Layout
        title="Producers’ documents database"
        description="Observations description..."
        url={url}
      >
        <StaticHeader
          title={this.props.intl.formatMessage({
            id: 'Producers’ documents database',
          })}
          background="/static/images/static-header/bg-observations.jpg"
        />
        <div className="c-section">
          <div className="l-container">
            <div className="row l-row">
              <div className="columns small-12">
                <Filters
                  options={parsedFilters.options}
                  filters={parsedFilters.data}
                  setFilters={this.props.setFilters}
                  filtersRefs={FILTERS_REFS}
                  // logFilter={this.logFilter}
                />
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
          ]}
          defaultSelected={this.state.tab}
          onChange={this.triggerChangeTab}
        />

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
                className="-inline -small -single-row"
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
      </Layout>
    );
  }
}

ObservationsPage.propTypes = {
  url: PropTypes.shape({}).isRequired,
  observations: PropTypes.object,
  intl: intlShape.isRequired,
  parsedFilters: PropTypes.object,
  parsedTableObservations: PropTypes.array,

  getObservations: PropTypes.func.isRequired,
  getObservationsUrl: PropTypes.func.isRequired,
  setActiveColumns: PropTypes.func.isRequired,
  setFilters: PropTypes.func.isRequired,
};

export default withTracker(
  withIntl(
    connect(
      (state) => ({
        observations: state.observations,
        parsedFilters: getParsedFilters(state),
        parsedChartObservations: getParsedChartObservations(state),
        parsedTableObservations: getParsedTableObservations(state),
        getObservationsLayers: getObservationsLayers(state),
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