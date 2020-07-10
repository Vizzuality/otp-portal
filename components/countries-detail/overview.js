/* eslint-disable max-len */
import React from 'react';
import PropTypes from 'prop-types';

import sortBy from 'lodash/sortBy';

// Intl
import { injectIntl, intlShape } from 'react-intl';

// Components
import Gallery1 from 'components/countries-detail/overview/gallery-1';

function OperatorsDetailOverview(props) {
  const { countriesDetail } = props;

  return (
    <div
      className="c-section"
    >
      <div className="l-container">
        <Gallery1 {...props} />

        <article className="c-article">
          <header>
            <h2 className="c-title">
              {props.intl.formatMessage({ id: 'country-detail.vpas.title' })}
            </h2>
          </header>

          <div className="content">
            <ul>
              {sortBy(countriesDetail.vpas.data, 'position').map(link => (
                <li
                  key={link.id}
                >
                  <a target="_blank" href={link.url} rel="noopener noreferrer">
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </article>

        <article className="c-article">
          <header>
            <h2 className="c-title">
              {props.intl.formatMessage({ id: 'country-detail.links.title' })}
            </h2>
          </header>

          <div className="content">
            <ul>
              {sortBy(countriesDetail.links.data, 'position').map(link => (
                <li
                  key={link.id}
                >
                  <a target="_blank" href={link.url} rel="noopener noreferrer">
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </article>
      </div>
    </div>
  );
}

OperatorsDetailOverview.propTypes = {
  countriesDetail: PropTypes.object,
  intl: intlShape.isRequired
};


export default injectIntl(OperatorsDetailOverview);
