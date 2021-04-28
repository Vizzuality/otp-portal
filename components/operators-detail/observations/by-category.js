import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';

// Constants
import {
  PALETTE_COLOR_1,
  ANIMATION_TIMES,
  LEGEND_SEVERITY,
} from 'constants/rechart';

// Utils
import { HELPERS_OBS } from 'utils/observations';

// Components
import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis } from 'recharts';
import ChartLegend from 'components/ui/chart-legend';

export default class TotalObservationsByOperatorByCategory extends React.Component {
  getXAxis(max) {
    if (this.props.horizontal) {
      return (
        <XAxis
          key="x-axis"
          hide
          axisLine={false}
          domain={[0, max]}
          type="number"
        />
      );
    }

    return <XAxis key="x-axis" hide axisLine />;
  }

  getYAxis(max) {
    if (this.props.horizontal) {
      return <YAxis key="y-axis" hide axisLine type="category" />;
    }

    return <YAxis key="y-axis" hide axisLine={false} domain={[0, max]} />;
  }

  render() {
    const { data, year, horizontal } = this.props;
    const groupedByCategory = HELPERS_OBS.getGroupedByCategory(data, year);
    const max = HELPERS_OBS.getMaxValue(groupedByCategory);

    const className = classnames({
      'c-chart-container': true,
      '-horizontal': !!horizontal,
    });

    const classColumns = classnames({
      columns: true,
      'small-12': horizontal,
      'small-6 medium-4 large-2': !horizontal,
    });

    const classChart = classnames({
      chart: true,
      '-max-width-100': !horizontal,
    });

    const classTitle = classnames({
      'c-title': true,
      '-default': true,
    });

    return (
      <div className={className}>
        {/* Legend */}
        <ChartLegend
          title={LEGEND_SEVERITY.title}
          list={LEGEND_SEVERITY.list}
          className="-horizontal"
        />

        {/* Charts */}
        <div className="row l-row">
          {Object.keys(groupedByCategory).map((category) => {
            const groupedBySeverity = HELPERS_OBS.getGroupedBySeverity(
              groupedByCategory[category],
              false,
              'level'
            );

            return (
              <div key={category} className={classColumns}>
                {/* <div key={category} className="columns small-6 medium-4 large-2"> */}
                <div className="c-chart">
                  {/* <div className="chart -max-width-100"> */}
                  <div className={classChart}>
                    <ResponsiveContainer height={horizontal ? 100 : 120}>
                      <BarChart
                        layout={horizontal ? 'vertical' : 'horizontal'}
                        data={groupedBySeverity}
                        barGap={horizontal ? 3 : 5}
                        barCategoryGap={0}
                        margin={{
                          top: 20,
                          right: 20,
                          bottom: 20,
                          left: 20,
                        }}
                        {...ANIMATION_TIMES}
                      >
                        {this.getXAxis(max)}
                        {this.getYAxis(max)}

                        <Bar
                          dataKey="hight"
                          fill={PALETTE_COLOR_1[3].fill}
                          label={{
                            position: horizontal ? 'right' : 'top',
                            formatter: (v) => v || null,
                          }}
                        />
                        <Bar
                          dataKey="medium"
                          fill={PALETTE_COLOR_1[2].fill}
                          label={{
                            position: horizontal ? 'right' : 'top',
                            formatter: (v) => v || null,
                          }}
                        />
                        <Bar
                          dataKey="low"
                          fill={PALETTE_COLOR_1[1].fill}
                          label={{
                            position: horizontal ? 'right' : 'top',
                            formatter: (v) => v || null,
                          }}
                        />
                        <Bar
                          dataKey="unknown"
                          fill={PALETTE_COLOR_1[0].fill}
                          label={{
                            position: horizontal ? 'right' : 'top',
                            formatter: (v) => v || null,
                          }}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  <h3 className={classTitle}>{category}</h3>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        {/* <footer>
          <Link
            href={{
              pathname: url.pathname,
              query: { id, tab: 'observations' }
            }}
            as={`/operators/${id}/observations`}
          >
            <a className="c-button -primary">Go to observations</a>
          </Link>
        </footer> */}
      </div>
    );
  }
}

TotalObservationsByOperatorByCategory.propTypes = {
  data: PropTypes.array,
  year: PropTypes.number,
  horizontal: PropTypes.bool,
};
