import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';

// Intl
import { injectIntl, intlShape } from 'react-intl';

// Utils
import { HELPERS_OBS } from 'utils/observations';

// components
import Table from 'components/ui/table';
import Icon from 'components/ui/icon';
import Tooltip from 'rc-tooltip/dist/rc-tooltip';


const MAX_ROWS_TABLE_ILLEGALITIES = 10;

class TotalObservationsByOperatorByCategorybyIlegallity extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      selected: {},
      indexPagination: 0
    };

    // BINDINGS
    this.triggerSelectedIllegality = this.triggerSelectedIllegality.bind(this);
  }

  /**
   * UI EVENTS
   * - triggerSelectedIllegality
  */
  triggerSelectedIllegality({ category, illegality, year }) {
    const { selected } = this.state;

    // Toggle selected
    if (selected.category === category &&
        selected.illegality === illegality &&
        selected.year === year
    ) {
      this.resetSelected();
    } else {
      this.setState({
        indexPagination: 0,
        selected: {
          category,
          illegality,
          year
        }
      });
    }
  }

  resetSelected = () => {
    this.setState({
      indexPagination: 0,
      selected: {}
    });
  }

  render() {
    const { selected } = this.state;
    const { data, year } = this.props;
    const groupedByCategory = HELPERS_OBS.getGroupedByCategory(data, year);

    return (
      <div className="c-observations-by-illegality">
        {/* Charts */}
        <ul className="obi-category-list">
          {Object.keys(groupedByCategory).map((category) => {
            const groupedByIllegality = HELPERS_OBS.getGroupedByIllegality(groupedByCategory[category]);

            return (
              <li key={category} className="obi-category-list-item">
                <div className="l-container">
                  <h3 className="c-title -default -proximanova -uppercase obi-category-title">{category}</h3>
                </div>

                <ul className="obi-illegality-list">
                  {Object.keys(groupedByIllegality).map((illegality) => {
                    const legalities = groupedByIllegality[illegality].length;
                    const paginatedItems = MAX_ROWS_TABLE_ILLEGALITIES * this.state.indexPagination;

                    const pageSize = (legalities - paginatedItems) > MAX_ROWS_TABLE_ILLEGALITIES ?
                        MAX_ROWS_TABLE_ILLEGALITIES : (legalities - paginatedItems);

                    const isSelected = selected.category === category
                      && selected.illegality === illegality
                      && selected.year === year;

                    const listItemClassNames = classnames({
                      '-selected': isSelected
                    });

                    return (
                      <li key={category + illegality}>
                        <div className="l-container">
                          <div className={`obi-illegality-list-item ${listItemClassNames}`}>
                            {/* Severity list */}
                            <ul className="obi-severity-list">
                              {groupedByIllegality[illegality].map(({ severity, id }) =>
                                <li key={id} className={`obi-severity-list-item -severity-${severity}`} />
                              )}
                            </ul>

                            {/* Illegality total */}
                            <div className={`obi-illegality-total ${listItemClassNames}`}>{legalities}</div>

                            {/* Illegality title */}
                            <h4
                              className="c-title -default obi-illegality-title"
                              onClick={() =>
                                this.triggerSelectedIllegality({ category, illegality, year })
                              }
                            >
                              {illegality}
                            </h4>
                          </div>
                        </div>

                        {/* Category */}
                        {isSelected &&
                          <div className="obi-illegality-info">
                            <div className="l-container">
                              <button
                                className="obi-illegality-info-close"
                                onClick={this.resetSelected}
                              >
                                <Icon name="icon-cross" className="-big" />
                              </button>
                              <h2 className="c-title obi-illegality-info-title">{illegality}</h2>
                              {groupedByIllegality[illegality].length > 0 &&
                                <Table
                                  sortable
                                  className="-light"
                                  data={groupedByIllegality[illegality]}
                                  options={{
                                    pagination: legalities > MAX_ROWS_TABLE_ILLEGALITIES,
                                    showPageSizeOptions: false,
                                    columns: [
                                      {
                                        Header: <span className="sortable">{this.props.intl.formatMessage({ id: 'date' })}</span>,
                                        accessor: 'date',
                                        headerClassName: '-a-left',
                                        className: '-a-left',
                                        minWidth: 100,
                                        Cell: (attr) => {
                                          const date = new Date(attr.value);
                                          const monthName = date ? date.toLocaleString('en-us', { month: 'short' }) : '-';
                                          const year = date ? date.getFullYear() : '-';
                                          return <span>{`${monthName} ${year}`}</span>;
                                        }
                                      },
                                      {
                                        Header: <span className="sortable">{this.props.intl.formatMessage({ id: 'severity' })}</span>,
                                        accessor: 'severity',
                                        headerClassName: '-a-center',
                                        className: '-a-left severity',
                                        minWidth: 150,
                                        Cell: attr => <span className={`severity-item -sev-${attr.value}`}>{attr.value}</span>
                                      },
                                      {
                                        Header: <span className="sortable">{this.props.intl.formatMessage({ id: 'status' })}</span>,
                                        accessor: 'status',
                                        headerClassName: '-a-left',
                                        className: '-a-left status description',
                                        minWidth: 150,
                                        Cell: attr => (
                                          <span>
                                            {this.props.intl.formatMessage({ id: `observations.status-${attr.value}` })}

                                            {[7, 8, 9].includes(attr.value) &&
                                              <Tooltip
                                                placement="bottom"
                                                overlay={(
                                                  <div style={{ maxWidth: 200 }}>
                                                    {this.props.intl.formatMessage({ id: `observations.status-${attr.value}.info` })}
                                                  </div>
                                                )}
                                                overlayClassName="c-tooltip no-pointer-events"
                                              >
                                                <button
                                                  className="c-button -icon -tertiary"
                                                >
                                                  <Icon name="icon-info" className="-smaller" />
                                                </button>
                                              </Tooltip>
                                            }
                                          </span>
                                        )
                                                                      },
                                      {
                                        Header: <span>{this.props.intl.formatMessage({ id: 'description' })}</span>,
                                        accessor: 'details',
                                        headerClassName: '-a-left',
                                        className: 'description',
                                        sortable: false,
                                        minWidth: 320,
                                        Cell: attr => <p>{attr.value}</p>
                                      },
                                      {
                                        Header: <span>{this.props.intl.formatMessage({ id: 'report' })}</span>,
                                        accessor: 'report',
                                        sortable: false,
                                        headerClassName: '-a-left',
                                        minWidth: 150,
                                        Cell: (attr) => {
                                          if (attr.value && attr.value.attachment && attr.value.attachment.url) {
                                            return (
                                              <a
                                                className="evidence-link"
                                                href={attr.value.attachment.url || '#'}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                title={attr.value.title}
                                              >
                                                {this.props.intl.formatMessage({ id: 'report' })}
                                              </a>
                                            );
                                          }

                                          return null;
                                        }
                                      },
                                      {
                                        Header: <span className="sortable">{this.props.intl.formatMessage({ id: 'evidence' })}</span>,
                                        accessor: 'evidence',
                                        headerClassName: '-a-left',
                                        className: 'evidence description',
                                        minWidth: 250,
                                        Cell: attr => (
                                          <div className="evidence-item-wrapper">
                                            {Array.isArray(attr.value) &&
                                              attr.value.map(v => (
                                                <a
                                                  href={v.attachment.url}
                                                  target="_blank"
                                                  rel="noopener noreferrer"
                                                  className="evidence-item"
                                                >
                                                  <Icon className="" name="icon-file-empty" />
                                                </a>
                                              ))
                                            }

                                            {!Array.isArray(attr.value) &&
                                              <span className="evidence-item-text">{attr.value}</span>
                                            }

                                          </div>
                                        )
                                      }
                                    ],
                                    nextPageSize: pageSize,
                                    pageSize,
                                    onPageChange: (indexPage) => {
                                      this.setState({ indexPagination: indexPage });
                                    }
                                  }}
                                />}
                            </div>
                          </div>
                        }
                      </li>
                    );
                  })}
                </ul>
              </li>
            );
          })}
        </ul>
      </div>
    );
  }
}

TotalObservationsByOperatorByCategorybyIlegallity.propTypes = {
  data: PropTypes.array,
  year: PropTypes.number,
  intl: intlShape.isRequired
};

export default injectIntl(TotalObservationsByOperatorByCategorybyIlegallity);
