import React, { Fragment } from 'react';
import PropTypes from 'prop-types';

// Utils
import isEmpty from 'lodash/isEmpty';
import { HELPERS_OBS } from 'utils/observations';

// Intl
import { injectIntl, intlShape } from 'react-intl';

// Components
import StaticTabs from 'components/ui/static-tabs';
import TotalObservationsByOperator from 'components/operators-detail/observations/total';
import TotalObservationsByOperatorByFMU from 'components/operators-detail/observations/by-fmu';
import TotalObservationsByOperatorByCategory from 'components/operators-detail/observations/by-category';
import TotalObservationsByOperatorByCategorybyIllegality from 'components/operators-detail/observations/by-category-illegality';

class OperatorsDetailObservations extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      year: HELPERS_OBS.getMaxYear(props.operatorObservations)
    };

    // BINDINGS
    this.onChangeYear = this.onChangeYear.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.operatorObservations !== nextProps.operatorObservations) {
      this.setState({
        year: HELPERS_OBS.getMaxYear(nextProps.operatorObservations)
      });
    }
  }

  /**
   * UI EVENTS
   * - onChangeYear
  */
  onChangeYear(year) {
    this.setState({ year });
  }

  render() {
    const groupedByFMU = HELPERS_OBS.getGroupedByFMU(this.props.operatorObservations);

    return (
      <div
        className="c-section"
      >
        {!!this.props.operatorObservations.length &&
          <Fragment>
            <article className="c-article">
              <div className="l-container">
                <header>
                  <h2 className="c-title">
                    {this.props.intl.formatMessage({ id: 'observations_from_independent_monitors' })}
                  </h2>
                </header>
                <div className="content">
                  <TotalObservationsByOperator data={this.props.operatorObservations} />
                </div>
              </div>
            </article>

            {!isEmpty(groupedByFMU) &&
              <article className="c-article">
                <div className="l-container">
                  <header>
                    <h2 className="c-title">
                      {this.props.intl.formatMessage({ id: 'observations_by_fmu' })}
                    </h2>
                  </header>
                  <div className="content">
                    <TotalObservationsByOperatorByFMU data={groupedByFMU} />
                  </div>
                </div>
              </article>
            }

            <article className="c-article">
              <div className="l-container">
                <header>
                  <h2 className="c-title">
                    {this.props.intl.formatMessage({ id: 'observations_by_category' })}
                  </h2>
                </header>
              </div>

              <div className="content">
                <StaticTabs
                  options={HELPERS_OBS.getYears(this.props.operatorObservations)}
                  defaultSelected={this.state.year.toString()}
                  onChange={this.onChangeYear}
                />

                <div className="l-container">
                  <div className="content">
                    {/* CHARTS */}
                    <article className="c-article">
                      <TotalObservationsByOperatorByCategory
                        data={this.props.operatorObservations}
                        year={parseInt(this.state.year, 10)}
                      />
                    </article>
                  </div>
                </div>
              </div>
            </article>

            <article className="c-article">
              <TotalObservationsByOperatorByCategorybyIllegality
                data={this.props.operatorObservations}
                year={parseInt(this.state.year, 10)}
              />
            </article>
          </Fragment>
        }

        {!this.props.operatorObservations.length &&
          <div className="l-container">
            <div className="c-no-data">
              {this.props.intl.formatMessage({ id: 'no-observations' })}
            </div>
          </div>
        }

      </div>
    );
  }
}

OperatorsDetailObservations.propTypes = {
  operatorObservations: PropTypes.array,
  intl: intlShape.isRequired
};

export default injectIntl(OperatorsDetailObservations);
