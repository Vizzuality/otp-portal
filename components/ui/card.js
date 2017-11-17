import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';

// Next components
import Link from 'next/link';

export default function Card({ theme, letter, title, description, link, Component }) {
  const classNames = classnames({
    [theme]: !!theme,
    '-has-link': !!link
  });

  const letterClassName = classnames({
    '-number': (letter && !isNaN(parseFloat(letter)))
  });

  return (
    <div className={`c-card ${classNames}`}>
      <div className="card-content">
        {letter && <div className={`card-letter ${letterClassName}`}> {letter} </div>}

        <h2 className="c-title -extrabig -uppercase -proximanova card-title"> {title} </h2>
        <p className="card-description" dangerouslySetInnerHTML={{ __html: description }} />
      </div>

      {!!Component &&
        <div className="card-component">
          {Component}
        </div>
      }
      {link &&
        <Link {...link} >
          <a className="card-link c-button -primary -fullwidth">{link.label}</a>
        </Link>
      }
    </div>
  );
}

Card.propTypes = {
  theme: PropTypes.string,
  letter: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  title: PropTypes.string,
  description: PropTypes.string,
  Component: PropTypes.any,
  link: PropTypes.oneOfType([PropTypes.object, PropTypes.bool])
};
