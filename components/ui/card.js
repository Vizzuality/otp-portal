import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';

// Next components
import Link from 'next/link';

export default function Card({ theme, letter, title, description, link }) {
  const classNames = classnames({
    [theme]: !!theme,
    '-has-link': !!link
  });

  return (
    <div className={`c-card ${classNames}`}>
      <div className="card-content">
        {letter && <div className="card-letter"> {letter} </div>}

        <h2 className="c-title -extrabig -uppercase -proximanova card-title"> {title} </h2>
        <p className="card-description" dangerouslySetInnerHTML={{ __html: description }} />
      </div>

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
  letter: PropTypes.string,
  title: PropTypes.string,
  description: PropTypes.string,
  link: PropTypes.object
};
