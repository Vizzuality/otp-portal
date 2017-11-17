import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import * as Cookies from 'js-cookie';

import Link from 'next/link';
import Dropdown, { DropdownTrigger, DropdownContent } from 'react-simple-dropdown';

import { injectIntl, intlShape } from 'react-intl';

class NavigationList extends React.Component {
  setActive(pathname) {
    const { url } = this.props;
    return classnames({
      '-active': (pathname.includes(url.pathname))
    });
  }

  changeLanguage(language) {
    Cookies.set('language', language);
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

        <li>
          <Dropdown
            className="c-language-dropdown"
          >
            <DropdownTrigger>
              <div className="header-nav-list-item">
                <span>{this.props.intl.formatMessage({ id: 'select_language' })}</span>
              </div>
            </DropdownTrigger>

            <DropdownContent>
              <ul className="language-dropdown-list">
                <li className="language-dropdown-list-item">
                  <a onClick={() => this.changeLanguage('en')} href="?language=en">English</a>
                </li>
                <li className="language-dropdown-list-item">
                  <a onClick={() => this.changeLanguage('fr')} href="?language=fr">Français</a>
                </li>
              </ul>
            </DropdownContent>
          </Dropdown>
        </li>
      </ul>
    );
  }
}

NavigationList.propTypes = {
  url: PropTypes.object,
  hideActive: PropTypes.bool,
  className: PropTypes.string,
  intl: intlShape.isRequired
};

export default injectIntl(NavigationList);
