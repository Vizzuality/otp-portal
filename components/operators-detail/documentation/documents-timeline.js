import React from 'react';
import PropTypes from 'prop-types';
import { AreaChart, XAxis, YAxis, Area, Tooltip } from 'recharts';
import { injectIntl } from 'react-intl';

// Utils
import { PALETTE } from 'utils/documentation';

function DocumentsTimeline({ timelineData }) {
  const chartData = timelineData
    .map((docsByDate) => {
      let buffer = 0;
      return {
        date: docsByDate.date,
        ...Object.keys(docsByDate.summary)
        .filter(k => k !== 'doc_not_required')
        .reduce((acc, k) => {
          const percentage =
            (docsByDate.summary[k] /
              (docsByDate.total - docsByDate.summary.doc_not_required)) *
            100;
          const item = {
            ...acc,
            [k]: [buffer, buffer + percentage, percentage]
          };
          buffer += percentage;
          return item;
        }, {})
      };
    })
    .reverse();

  return (
    <div className="c-timeline-chart">
      <AreaChart width={800} height={250} data={chartData}>
        <XAxis dataKey="date" />
        <YAxis />
        {chartData && chartData[0] && Object.keys(chartData[0]).filter(k => k !== 'date').map(k => (
          <Area dataKey={k} stroke={PALETTE[k].stroke} fill={PALETTE[k].fill} fillOpacity="1" />
        ))}
        <Tooltip formatter={values => `${values[2].toFixed(2)}%`} />
      </AreaChart>
    </div>
  );
}

DocumentsTimeline.propTypes = {
  timelineData: PropTypes.array
};

export default injectIntl(DocumentsTimeline);