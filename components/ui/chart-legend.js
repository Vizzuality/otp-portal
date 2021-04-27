import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';

// Intl
import { injectIntl, intlShape } from 'react-intl';

// Components
import Link from 'next/link';
import Icon from 'components/ui/icon';

function ChartLegend({ title, list, className, intl }) {
  const classNames = classnames({
    [className]: !!className
  });

  return (
    <div className={`c-chart-legend ${classNames}`}>
      {title &&
        <h4 className="c-title -default -proximanova chart-legend-title">
          <Link
            href={{
              pathname: '/help',
              query: { tab: 'how-otp-works', article: 'assessing-severity-of-observations' }
            }}
            as={'/help/how-otp-works?article=assessing-severity-of-observations'}
          >
            <a><Icon name="icon-info" className="-smaller" /></a>
          </Link>

          {intl.formatMessage({ id: 'legend.title' })}:
        </h4>
      }

      <ul className="chart-legend-list">
        {list.map(item => (
          <li key={item.id || item.label} className="chart-legend-item">
            <span className="chart-legend-dot" style={{ background: item.fill, border: `2px solid ${item.stroke}` }} />
            <span className="chart-legend-label">
              {intl.formatMessage({ id: item.id || item.label })}
              {' - '}
              {typeof item.value !== 'undefined' && <span> {item.value}%</span>}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

ChartLegend.propTypes = {
  title: PropTypes.string,
  list: PropTypes.array,
  className: PropTypes.string,
  intl: intlShape.isRequired
};

export default injectIntl(ChartLegend);
