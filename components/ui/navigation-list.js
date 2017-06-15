import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import Link from 'next/link';


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
          <Link href="/">
            <a className={!hideActive ? this.setActive(['/']) : ''}>Coming soon</a>
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
