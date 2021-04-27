import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';

// Intl
import { injectIntl, intlShape } from 'react-intl';

// Utils
import { HELPERS_OBS } from 'utils/observations';
import { PALETTE_COLOR_1 } from 'constants/rechart';

// components
import Table from 'components/ui/table';
import Icon from 'components/ui/icon';
import CheckboxGroup from 'components/form/CheckboxGroup';

import {
  tableCheckboxes,
  getColumnHeaders,
} from 'constants/observations-column-headers';

const MAX_ROWS_TABLE_ILLEGALITIES = 10;

class TotalObservationsByOperatorByCategorybyIlegallity extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      selected: {},
      indexPagination: 0,
      columns: [
        'status',
        'date',
        'country',
        'operator',
        'category',
        'observation',
        'level',
        'fmu',
        'report',
      ],
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
    if (
      selected.category === category &&
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
          year,
        },
      });
    }
  }

  resetSelected() {
    this.setState({
      indexPagination: 0,
      selected: {},
    });
  }

  render() {
    const { selected } = this.state;
    const { data, year } = this.props;
    const groupedByCategory = HELPERS_OBS.getGroupedByCategory(data, year);

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
      <div className="c-observations-by-illegality">
        {/* Charts */}
        <ul className="obi-category-list">
          {Object.keys(groupedByCategory).map((category) => {
            const groupedByIllegality = HELPERS_OBS.getGroupedByIllegality(
              groupedByCategory[category]
            );

            return (
              <li key={category} className="obi-category-list-item">
                <div className="l-container">
                  <h3 className="c-title -default -proximanova -uppercase obi-category-title">
                    {category}
                  </h3>
                </div>

                <ul className="obi-illegality-list">
                  {Object.keys(groupedByIllegality).map((illegality) => {
                    const legalities = groupedByIllegality[illegality].length;
                    const paginatedItems =
                      MAX_ROWS_TABLE_ILLEGALITIES * this.state.indexPagination;

                    const pageSize =
                      legalities - paginatedItems > MAX_ROWS_TABLE_ILLEGALITIES
                        ? MAX_ROWS_TABLE_ILLEGALITIES
                        : legalities - paginatedItems;

                    const isSelected =
                      selected.category === category &&
                      selected.illegality === illegality &&
                      selected.year === year;

                    const listItemClassNames = classnames({
                      '-selected': isSelected,
                    });

                    return (
                      <li key={category + illegality}>
                        <div className="l-container">
                          <div
                            className={`obi-illegality-list-item ${listItemClassNames}`}
                          >
                            {/* Severity list */}
                            <ul className="obi-severity-list">
                              {groupedByIllegality[illegality].map(
                                ({ level, id }) => {
                                  if (level === 'null' || level === null)
                                    return null;

                                  return (
                                    <li
                                      key={id}
                                      className={`obi-severity-list-item -severity-${level}`}
                                      style={{
                                        background: PALETTE_COLOR_1[level].fill,
                                      }}
                                    />
                                  );
                                }
                              )}
                            </ul>

                            {/* Illegality total */}
                            <div
                              className={`obi-illegality-total ${listItemClassNames}`}
                            >
                              {legalities}
                            </div>

                            {/* Illegality title */}
                            <h4
                              className="c-title -default obi-illegality-title"
                              onClick={() =>
                                this.triggerSelectedIllegality({
                                  category,
                                  illegality,
                                  year,
                                })
                              }
                            >
                              {illegality}
                            </h4>
                          </div>
                        </div>

                        {/* Category */}
                        {isSelected && (
                          <div className="obi-illegality-info">
                            <div className="l-container">
                              <button
                                className="obi-illegality-info-close"
                                onClick={this.resetSelected}
                              >
                                <Icon name="icon-cross" className="-big" />
                              </button>
                              <h2 className="c-title obi-illegality-info-title">
                                {illegality}
                              </h2>
                              {groupedByIllegality[illegality].length > 0 && (
                                <Fragment>
                                  <CheckboxGroup
                                    className="-inline -single-row -light"
                                    name="observations-columns"
                                    onChange={(value) =>
                                      this.setState({ columns: value })
                                    }
                                    properties={{
                                      default: this.state.columns,
                                      name: 'observations-columns',
                                    }}
                                    options={tableOptions}
                                  />
                                  <br />
                                  <Table
                                    sortable
                                    className="-light"
                                    data={groupedByIllegality[illegality]}
                                    options={{
                                      pagination:
                                        legalities >
                                        MAX_ROWS_TABLE_ILLEGALITIES,
                                      showPageSizeOptions: false,
                                      columns: columnHeaders.filter((header) =>
                                        this.state.columns.includes(
                                          header.accessor
                                        )
                                      ),
                                      nextPageSize: pageSize,
                                      pageSize,
                                      onPageChange: (indexPage) => {
                                        this.setState({
                                          indexPagination: indexPage,
                                        });
                                      },
                                    }}
                                  />
                                </Fragment>
                              )}
                            </div>
                          </div>
                        )}
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
  intl: intlShape.isRequired,
};

export default injectIntl(TotalObservationsByOperatorByCategorybyIlegallity);
