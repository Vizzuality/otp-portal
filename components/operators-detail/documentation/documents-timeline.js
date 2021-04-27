import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis } from 'recharts';
import { injectIntl, intlShape } from 'react-intl';
import moment from 'moment';
import groupBy from 'lodash/groupBy';

// Utils
import { PALETTE } from 'utils/documentation';

function CustomTooltip({ active, payload, label, intl }) {
  if (active) {
    const validDocs = payload.find((p) => p.dataKey === 'doc_valid');

    return (
      <div className="c-custom-tooltip">
        <p className="date-label">
          {
            intl.formatDate(label, {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric'
            })
          }
        </p>
        <p className="valid-count">
          {intl.formatMessage(
            {
              id: 'operator-detail.documents.title',
            },
            {
              percentage: validDocs.value[2].toFixed(2),
            }
          )}
        </p>
        <div className="tooltip-categories">
          {payload.map((category) => {
            const pctValue = category && category.value && category.value[2];
            if (pctValue) {
              return (
                <p className="tooltip-category">
                  <svg height="10" width="10">
                    <circle cx="5" cy="5" r="5" fill={category.fill} />
                  </svg>
                  {category.value[2].toFixed(2)}%{' '}
                  {intl.formatMessage({ id: category.name })}
                </p>
              );
            }
            return null;
          })}
        </div>
      </div>
    );
  }

  return null;
}

CustomTooltip.propTypes = {
  active: PropTypes.bool,
  payload: PropTypes.object,
  label: PropTypes.string,
  intl: intlShape.isRequired,
};

function DocumentsTimeline({ timelineData = [], intl }) {

  const chartData = timelineData
    .map((docsByDate) => {
      let buffer = 0;
      const d = new Date(docsByDate.date);

      return {
        time: d.getTime() + (d.getTimezoneOffset() * 60000),
        year: d.getFullYear(),
        date: docsByDate.date,
        ...Object.keys(docsByDate.summary)
          .filter((k) => k !== 'doc_not_required')
          .reduce((acc, k) => {
            const percentage =
              (docsByDate.summary[k] /
                (docsByDate.total - docsByDate.summary.doc_not_required)) *
              100;
            const item = {
              ...acc,
              [k]: [buffer, buffer + percentage, percentage],
            };
            buffer += percentage;
            return item;
          }, {}),
      };
    })
    .reverse();

  const ticks = useMemo(() => {
    const yearsData = groupBy(chartData, 'year');
    return Object.keys(yearsData).map(d => {
      const startDate = yearsData[d][0];
      const endDate = yearsData[d][yearsData[d].length - 1];
      return (startDate.time + endDate.time)/2;
    })
  }, [chartData])

  return (
    <div className="c-timeline-chart">
      <ResponsiveContainer width="100%" height={90}>
        <AreaChart data={chartData}>

          <XAxis
            dataKey="time"
            scale="time"
            type="number"
            domain={['dataMin', 'dataMax']}
            ticks={ticks}
            tick={{ fontWeight: 'bold', fontFamily: "Proxima Nova", fontSize: 12 }}
            tickLine={false}
            tickFormatter={(l) => moment(l).format('YYYY')}
          />

          {chartData &&
            chartData[0] &&
            Object.keys(chartData[0])
              .filter((k) => k !== 'date' && k !== 'time' && k !== 'year')
              .map((k) => (
                <Area
                  dataKey={k}
                  stroke={PALETTE[k].stroke}
                  fill={PALETTE[k].fill}
                  fillOpacity="1"
                />
              ))}

          <Tooltip
            content={(props) => <CustomTooltip intl={intl} {...props} />}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

DocumentsTimeline.propTypes = {
  timelineData: PropTypes.array,
  intl: intlShape.isRequired,
};

export default injectIntl(DocumentsTimeline);
