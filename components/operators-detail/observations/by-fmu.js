import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';


// Utils
import { HELPERS_OBS } from 'utils/observations';

// Intl
import { injectIntl, intlShape } from 'react-intl';

// Constants
import { PALETTE_COLOR_1, LEGEND_SEVERITY } from 'constants/rechart';

// Components
import Select from 'react-select';
import ChartLegend from 'components/ui/chart-legend';

class TotalObservationsByOperatorByFMU extends React.Component {

  constructor(props) {
    super(props);
    const { data } = props;
    const fmuIds = Object.keys(data);

    this.state = {
      fmu: fmuIds[0]
    };
  }

  render() {
    const { data } = this.props;
    const { fmu } = this.state;

    const groupedByYear = HELPERS_OBS.getGroupedByYear(data[fmu]);
    const max = HELPERS_OBS.getMaxLength(groupedByYear);

    return (
      <div className="c-observations-by-operator">
        <div className="obo-fmu">
          <h3>
            <Select
              instanceId={'fmu'}
              name={'fmu'}
              options={Object.keys(data).map(f => ({ label: f, value: f }))}
              value={fmu}
              onChange={v => this.setState({ fmu: v.value })}
              clearable={false}
            />
          </h3>

          <header className="obo-year-header">
            <span className="c-title -default -proximanova -uppercase">
              {this.props.intl.formatMessage({ id: 'year' })}
            </span>
            <span className="c-title -default -proximanova -uppercase">
              {this.props.intl.formatMessage({ id: 'observations_im_visitis' })}
            </span>
          </header>

          {/* YEAR LIST */}
          <ul className="obo-year-list">
            {Object.keys(groupedByYear).sort((a, b) => b - a).map((year, i) => {
              const groupedBySeverity = HELPERS_OBS.getGroupedBySeverity(groupedByYear[year], true);
              const length = groupedByYear[year].length;
              const observationListClassNames = classnames({
                '-big': i === 0
              });

              return (
                <li
                  key={year}
                  className="obo-year-list-item"
                >
                  <header className="obo-observations-header">
                    <span>{year}</span>
                    <span>{length} ({HELPERS_OBS.getMonitorVisits(groupedByYear[year])})</span>
                  </header>

                  {/* SEVERITY LIST */}
                  <ul
                    className={`obo-observations-list ${observationListClassNames}`}
                    style={{ width: `${(length / max) * 100}%` }}
                  >
                    {Object.keys(groupedBySeverity).sort((a, b) => b - a).map((severity) => {
                      if (severity === 'null') return null;
                      const lengthSeverity = groupedBySeverity[severity].length;

                      return (
                        <li
                          key={severity}
                          style={{ width: `${(lengthSeverity / length) * 100}%`, background: PALETTE_COLOR_1[severity].fill }}
                          className={`obo-observations-list-item -severity-${severity}`}
                        >
                          {i === 0 && lengthSeverity}
                        </li>
                      );
                    })}
                  </ul>
                </li>
              );
            })}
          </ul>

          {/* Legend */}
          <ChartLegend
            title={LEGEND_SEVERITY.title}
            list={LEGEND_SEVERITY.list}
            className="-horizontal"
          />
        </div>
      </div>
    );
  }
}

TotalObservationsByOperatorByFMU.propTypes = {
  data: PropTypes.array,
  intl: intlShape.isRequired
};

export default injectIntl(TotalObservationsByOperatorByFMU);
