import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { connect } from 'react-redux';
import { injectIntl } from 'react-intl';


import Datepicker from 'components/ui/datepicker';

import {
  setOperatorDocumentationDate,
  setOperatorDocumentationFMU,
} from 'modules/operators-detail';
import {
  getOperatorDocumentationDate,
  getOperatorDocumentationFMU,
  getFMUs,
} from 'selectors/operators-detail/documentation';

function DocumentsFilter({
  date,
  setDate,
  showDate,
  fmus,
  FMU,
  setFMU,
  showFMU,
  intl
}) {
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const minDate = process.env.DOCUMENTS_MINDATE;

  useEffect(() => {
    // on component load, reset FMU and date.
    setFMU(null);
    setDate(new Date());
  }, []);

  return (
    <div className="c-doc-filters">
      <h3>{intl.formatMessage({ id: 'filter.title' })}</h3>
      {fmus.length > 0 && showFMU && (
        <span className="filter-option">
          <label htmlFor="business">{intl.formatMessage({ id: 'fmu' })}</label>
          <div className="filters-dropdown">
            <button
              className="dropdown-placeholder"
              onClick={() => setDropdownOpen(!isDropdownOpen)}
            >
              {FMU ? FMU.name : intl.formatMessage({ id: 'filter.fmu_id.placeholder' })}
            </button>

            {isDropdownOpen && (
              <div className="dropdown-content">
                {[null, ...fmus].map((_fmu) => (
                  <option
                    key={_fmu ? _fmu.id : 'no-fmu'}
                    onClick={() => {
                      setFMU(_fmu);
                      setDropdownOpen(false);
                    }}
                  >
                    {_fmu ? _fmu.name : intl.formatMessage({ id: 'filter.fmu_id.placeholder' })}
                  </option>
                ))}
              </div>
            )}
          </div>
        </span>
      )}

      {showDate && (
        <span className="filter-option">
          <label htmlFor="business">{intl.formatMessage({ id: 'date' })}</label>

          <Datepicker
            className="filters-date -inline"
            date={moment(date)}
            dateFormat="dd MMM yyyy"
            settings={{
              numberOfMonths: 1,
              minDate: moment(minDate).add(1, 'days'),
              maxDate: moment(new Date()),
              hideKeyboardShortcutsPanel: true,
              noBorder: true,
              readOnly: false,
            }}
            onDateChange={(d) => setDate(moment(d).format('YYYY-MM-DD'))}
          />
        </span>
      )}
    </div>
  );
}

DocumentsFilter.propTypes = {
  date: PropTypes.string,
  setDate: PropTypes.func,
  FMU: PropTypes.object,
  setFMU: PropTypes.func,
  fmus: PropTypes.array,
  showDate: PropTypes.bool,
  showFMU: PropTypes.bool,
};

export default injectIntl(connect(
  (state) => ({
    date: getOperatorDocumentationDate(state),
    FMU: getOperatorDocumentationFMU(state),
    fmus: getFMUs(state),
  }),
  {
    setDate: setOperatorDocumentationDate,
    setFMU: setOperatorDocumentationFMU,
  }
)(DocumentsFilter));
