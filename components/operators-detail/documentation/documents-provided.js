import React from 'react';
import PropTypes from 'prop-types';
import sortBy from 'lodash/sortBy';

// Utils
import { HELPERS_DOC } from 'utils/documentation';

// Constants
import { LEGEND_DOCUMENTATION } from 'constants/rechart';

// Components
import { PieChart, Pie, ResponsiveContainer, Cell } from 'recharts';
import ChartLegend from 'components/ui/chart-legend';

export default function DocumentsProvided(props) {
  const { data } = props;

  const groupedByCategory = HELPERS_DOC.getGroupedByCategory(data);
  const groupedByStatusChart = HELPERS_DOC.getGroupedByStatusChart(data);
  const max = HELPERS_DOC.getMaxLength(groupedByCategory);

  return (
    <div className="c-doc-provided">
      <div className="row l-row">
        <div className="columns small-6">
          <div className="c-chart">
            <ResponsiveContainer height={360}>
              <PieChart>
                <Pie
                  data={groupedByStatusChart}
                  dataKey="value"
                  outerRadius={150}
                  innerRadius={142}
                  startAngle={90}
                  endAngle={-270}
                  isAnimationActive={false}
                  // If you want to change the labels you should do something similar to this
                  // https://github.com/recharts/recharts/blob/master/src/polar/Pie.js#L339
                  label={{
                    fill: '#333'
                  }}
                  labelLine={false}
                >
                  {groupedByStatusChart.map(entry =>
                    <Cell key={entry.name} fill={entry.fill} stroke={entry.stroke} />
                  )}
                </Pie>
              </PieChart>
            </ResponsiveContainer>

            {/* Legend */}
            <ChartLegend
              list={LEGEND_DOCUMENTATION.list}
              className="-absolute"
            />
          </div>
        </div>

        <div className="columns small-6">
          <div className="c-doc-by-category">
            <ul className="doc-by-category-list">
              {sortBy(Object.keys(groupedByCategory)).map((category) => {
                const groupedByStatus = HELPERS_DOC.getGroupedByStatus(groupedByCategory[category]);
                const width = `${(groupedByCategory[category].length / max) * 100}%`;

                return (
                  <li
                    key={category}
                    className="doc-by-category-list-item"
                  >
                    <div className="doc-by-category-chart">
                      <div
                        className="doc-by-category-bar"
                        style={{ width }}
                      >
                        {sortBy(Object.keys(groupedByStatus)).map((status) => {
                          const segmentWidth = `${(groupedByStatus[status].length / groupedByCategory[category].length) * 100}%`;

                          return (
                            <div
                              key={status}
                              className={`doc-by-category-bar-segment -${status}`}
                              style={{ width: segmentWidth }}
                            />
                          );
                        })}
                      </div>
                    </div>
                    <h3 className="c-title -default doc-by-category-title">{category}</h3>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

DocumentsProvided.defaultProps = {
  data: []
};

DocumentsProvided.propTypes = {
  data: PropTypes.array
};
