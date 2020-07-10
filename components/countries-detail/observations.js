import React, { Fragment } from 'react';
import PropTypes from 'prop-types';

// Utils
import { HELPERS_OBS } from 'utils/observations';

// Intl
import { injectIntl, intlShape } from 'react-intl';

// Components
import StaticTabs from 'components/ui/static-tabs';
import TotalObservationsByCountry from 'components/countries-detail/observations/total';
import TotalObservationsByCountryByCategory from 'components/countries-detail/observations/by-category';
import TotalObservationsByCountryByCategorybyIllegality from 'components/countries-detail/observations/by-category-illegality';

class OperatorsDetailObservations extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      year: HELPERS_OBS.getMaxYear(props.countryObservations)
    };

    // BINDINGS
    this.onChangeYear = this.onChangeYear.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.countryObservations !== nextProps.countryObservations) {
      this.setState({
        year: HELPERS_OBS.getMaxYear(nextProps.countryObservations)
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
    return (
      <div
        className="c-section"
      >
        {!!this.props.countryObservations.length &&
          <Fragment>
            <article className="c-article">
              <div className="l-container">
                <header>
                  <h2 className="c-title">
                    {this.props.intl.formatMessage({ id: 'observations_from_independent_monitors' })}
                  </h2>
                </header>
                <div className="content">
                  <TotalObservationsByCountry data={this.props.countryObservations} />
                </div>
              </div>
            </article>

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
                  options={HELPERS_OBS.getYears(this.props.countryObservations)}
                  defaultSelected={this.state.year.toString()}
                  onChange={this.onChangeYear}
                />

                <div className="l-container">
                  <div className="content">
                    {/* CHARTS */}
                    <article className="c-article">
                      <TotalObservationsByCountryByCategory
                        data={this.props.countryObservations}
                        year={parseInt(this.state.year, 10)}
                      />
                    </article>
                  </div>
                </div>
              </div>
            </article>

            <article className="c-article">
              <TotalObservationsByCountryByCategorybyIllegality
                data={this.props.countryObservations}
                year={parseInt(this.state.year, 10)}
              />
            </article>
          </Fragment>
        }

        {!this.props.countryObservations.length &&
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
  countryObservations: PropTypes.array,
  intl: intlShape.isRequired
};

export default injectIntl(OperatorsDetailObservations);
