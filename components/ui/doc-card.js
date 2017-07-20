import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';

export default function DocCard(props) {
  const { date, status, title } = props;

  const classNames = classnames({
    [`-${status}`]: !!status
  });

  return (
    <div className={`c-doc-card ${classNames}`}>
      <header className="doc-card-header">
        <div className="doc-card-date">{date}</div>
        <div className="doc-card-status">{status}</div>
      </header>
      <div className="doc-card-content">
        <h3 className="doc-card-title c-title -big">{title}</h3>
      </div>
    </div>
  );
}

DocCard.propTypes = {
  status: PropTypes.string,
  title: PropTypes.string,
  date: PropTypes.string
};
