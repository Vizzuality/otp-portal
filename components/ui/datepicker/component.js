import React, { PureComponent } from 'react';
import { createPortal } from 'react-dom';
import PropTypes from 'prop-types';
import ReactDatePicker, { CalendarContainer } from 'react-datepicker';
import classnames from 'classnames';

import Input from './input';

class Datepicker extends PureComponent {
  // eslint-disable-next-line class-methods-use-this
  renderCalendarContainer({ children }) {
    let container;
    if (typeof window !== 'undefined') {
      container = document.querySelector('#__next');
    }
    return container
      ? createPortal(
        <CalendarContainer>{children}</CalendarContainer>,
          container
        )
      : null;
  }

  render() {
    const {
      className,
      onDateChange,
      settings,
      theme,
      date,
      dateFormat,
    } = this.props;
    const { minDate, maxDate } = settings;

    return (
      <div
        ref={(ref) => {
          this.ref = ref;
        }}
        className={classnames('c-datepicker', theme, className)}
      >
        <ReactDatePicker
          className="datepicker-input"
          selected={date.toDate()}
          minDate={new Date(minDate)}
          maxDate={new Date(maxDate)}
          dateFormat={dateFormat || 'dd MMM'}
          // Custom components
          customInput={<Input />}
          // Popper
          popperContainer={this.renderCalendarContainer}
          popperPlacement="top-start"
          popperClassName="c-datepicker-popper"
          popperModifiers={{
            flip: {
              enabled: false,
            },
            offset: {
              enabled: true,
              offset: '0px, -15px',
            },
            preventOverflow: {
              enabled: true,
              escapeWithReference: false, // force popper to stay in viewport (even when input is scrolled out of view)
              boundariesElement: 'viewport',
            },
          }}
          // Func
          onSelect={onDateChange}
          // renderCustomHeader={this.renderCalendarHeader}
        />
      </div>
    );
  }
}

Datepicker.propTypes = {
  className: PropTypes.string,
  theme: PropTypes.string,
  date: PropTypes.object,
  dateFormat: PropTypes.string,
  onDateChange: PropTypes.func.isRequired,
  settings: PropTypes.object,
};

export default Datepicker;
