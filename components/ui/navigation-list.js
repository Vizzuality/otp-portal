import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';

import Link from 'next/link';

import { FormattedMessage } from 'react-intl';

export default class NavigationList extends React.Component {
  setActive(pathname) {
    const { url } = this.props;
    return classnames({
      '-active': (pathname.includes(url.pathname))
    });
  }

  render() {
    const { hideActive, className } = this.props;
    const classNames = classnames({
      'c-navigation-list': true,
      [className]: !!className
    });

    return (
      <ul className={classNames}>
        <li>
          <Link prefetch href="/operators">
            <a className={!hideActive ? this.setActive(['/operators', '/operators-detail']) : ''}>
              <FormattedMessage id="nav.operators" />
            </a>
          </Link>
        </li>
        <li>
          <Link prefetch href="/observations">
            <a className={!hideActive ? this.setActive(['/observations']) : ''}>
              <FormattedMessage id="nav.observations" />
            </a>
          </Link>
        </li>
        <li>
          <Link prefetch href="/help">
            <a className={!hideActive ? this.setActive(['/help']) : ''}>
              <FormattedMessage id="nav.help" />
            </a>
          </Link>
        </li>
        <li>
          <Link prefetch href="/about">
            <a className={!hideActive ? this.setActive(['/about']) : ''}>
              <FormattedMessage id="nav.about" />
            </a>
          </Link>
        </li>
      </ul>
    );
  }
}

NavigationList.propTypes = {
  url: PropTypes.object,
  hideActive: PropTypes.bool,
  className: PropTypes.string
};
