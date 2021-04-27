import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

// Utils
import { HELPERS_OBS } from 'utils/observations';

// Intl
import { injectIntl, intlShape } from 'react-intl';

import { getOperatorDocumentationFMU } from 'selectors/operators-detail/documentation';

// Components
import StaticTabs from 'components/ui/static-tabs';
import TotalObservationsByOperator from 'components/operators-detail/observations/total';
import TotalObservationsByOperatorByCategory from 'components/operators-detail/observations/by-category';
import TotalObservationsByOperatorByCategorybyIllegality from 'components/operators-detail/observations/by-category-illegality';
import DocumentsFilter from 'components/operators-detail/documentation/documents-filter';

class OperatorsDetailObservations extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      year: HELPERS_OBS.getMaxYear(props.operatorObservations),
    };

    // BINDINGS
    this.onChangeYear = this.onChangeYear.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.operatorObservations !== nextProps.operatorObservations) {
      this.setState({
        year: HELPERS_OBS.getMaxYear(nextProps.operatorObservations),
      });
    }
  }

  componentDidUpdate(prevProps) {
    const { FMU } = this.props;
    const { FMU: prevFMU } = prevProps;

    if ((FMU && prevFMU && FMU.id !== prevFMU.id) || (!prevFMU && !!FMU)) {
      this.setState({
        year: HELPERS_OBS.getMaxYear(this.props.operatorObservations.filter(
          (obs) => obs.fmu && obs.fmu.id === this.props.FMU.id
        ))
      })
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
    const observationData = this.props.FMU
      ? this.props.operatorObservations.filter(
          (obs) => obs.fmu && obs.fmu.id === this.props.FMU.id
        )
      : this.props.operatorObservations;
    return (
      <div className="c-section">
        <div className="l-container">
          <DocumentsFilter showFMU />
        </div>

        {!!observationData.length && (
          <Fragment>
            <article className="c-article">
              <div className="l-container">
                <header>
                  <h2 className="c-title">
                    {this.props.intl.formatMessage({
                      id: 'observations_from_independent_monitors',
                    })}
                  </h2>
                </header>
                <div className="content">
                  <TotalObservationsByOperator data={observationData} />
                </div>
              </div>
            </article>

            {/* {!isEmpty(groupedByFMU) && (
              <article className="c-article">
                <div className="l-container">
                  <header>
                    <h2 className="c-title">
                      {this.props.intl.formatMessage({
                        id: 'observations_by_fmu',
                      })}
                    </h2>
                  </header>
                  <div className="content">
                    <TotalObservationsByOperatorByFMU data={groupedByFMU} />
                  </div>
                </div>
              </article>
            )} */}

            <article className="c-article">
              <div className="l-container">
                <header>
                  <h2 className="c-title">
                    {this.props.intl.formatMessage({
                      id: 'observations_by_category',
                    })}
                  </h2>
                </header>
              </div>

              <div className="content">
                <StaticTabs
                  options={HELPERS_OBS.getYears(observationData)}
                  defaultSelected={this.state.year.toString()}
                  onChange={this.onChangeYear}
                />

                <div className="l-container">
                  <div className="content">
                    {/* CHARTS */}
                    <article className="c-article">
                      <TotalObservationsByOperatorByCategory
                        data={observationData}
                        year={parseInt(this.state.year, 10)}
                      />
                    </article>
                  </div>
                </div>
              </div>
            </article>

            <article className="c-article">
              <TotalObservationsByOperatorByCategorybyIllegality
                data={observationData}
                year={parseInt(this.state.year, 10)}
              />
            </article>
          </Fragment>
        )}

        {!observationData.length && (
          <div className="l-container">
            <div className="c-no-data">
              {this.props.intl.formatMessage({ id: 'no-observations' })}
            </div>
          </div>
        )}
      </div>
    );
  }
}

OperatorsDetailObservations.propTypes = {
  operatorObservations: PropTypes.array,
  FMU: PropTypes.shape({ id: PropTypes.string }),
  intl: intlShape.isRequired,
};

export default injectIntl(
  connect(
    (state) => ({
      FMU: getOperatorDocumentationFMU(state),
    }),
    {}
  )(OperatorsDetailObservations)
);
