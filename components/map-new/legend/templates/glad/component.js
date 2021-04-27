import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';

// Intl
import { injectIntl, intlShape } from 'react-intl';

import Datepicker from 'components/ui/datepicker';

class LegendTemplateGLAD extends PureComponent {
  static propTypes = {
    activeLayer: PropTypes.shape({}).isRequired,
    setLayerSettings: PropTypes.func.isRequired,
    intl: intlShape
  }

  onDateChange = (value, who) => {
    const { activeLayer, setLayerSettings } = this.props;

    const { id, decodeParams } = activeLayer;

    setLayerSettings({
      id,
      settings: {
        decodeParams: {
          ...decodeParams,
          [who]: moment(value).format('YYYY-MM-DD'),
          ...who === 'trimEndDate' && {
            endDate: moment(value).format('YYYY-MM-DD')
          }
        }
      }
    })
  }

  render() {
    const { activeLayer, intl } = this.props;
    const { decodeParams, timelineParams } = activeLayer;

    const { startDate, trimEndDate } = decodeParams;
    const { minDate, maxDate, maxAbsoluteDate, minAbsoluteDate } = timelineParams;

    const min = minDate < minAbsoluteDate ? minAbsoluteDate : minDate;
    const max = maxDate > maxAbsoluteDate ? maxAbsoluteDate : maxDate;
    const trim = trimEndDate > maxAbsoluteDate ? maxAbsoluteDate : trimEndDate;

    return (
      <div className="c-legend-template-glad">
        {typeof window !== 'undefined' &&
          <>
            <span>
              {intl.formatMessage({ id: 'from' })}
            </span>

            <Datepicker
              className="-inline"
              date={moment(startDate < min ? min : startDate)}
              dateFormat="dd MMM yyyy"
              settings={{
                numberOfMonths: 1,
                minDate: min,
                maxDate: trim,
                isOutsideRange: d =>
                  d.isAfter(moment(trim)) ||
                    d.isBefore(moment(min)),
                hideKeyboardShortcutsPanel: true,
                noBorder: true,
                readOnly: true
              }}
              onDateChange={(date) => this.onDateChange(date, 'startDate')}
            />

            <span>
              {intl.formatMessage({ id: 'to' })}
            </span>

            <Datepicker
              className="-inline"
              date={moment(trim || max)}
              dateFormat="dd MMM yyyy"
              settings={{
                numberOfMonths: 1,
                minDate: startDate,
                maxDate: max,
                isOutsideRange: d =>
                  d.isAfter(moment(max)) || d.isBefore(moment(startDate)),
                hideKeyboardShortcutsPanel: true,
                noBorder: true,
                readOnly: true
              }}
              onDateChange={(date) => this.onDateChange(date, 'trimEndDate')}
            />
          </>
        }

      </div>
    );
  }
}

export default injectIntl(LegendTemplateGLAD);
