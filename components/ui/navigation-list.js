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
        {hideActive &&
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
                  <li className="language-dropdown-list-item">
                    <a onClick={() => this.changeLanguage('zh')} href="?language=zh">中文</a>
                  </li>
                </ul>
              </DropdownContent>
            </Dropdown>
          </li>
        }
        <li>
          <Link href="/countries">
            <a className={!hideActive ? this.setActive(['/countries', '/countries-detail']) : ''}>
              {this.props.intl.formatMessage({ id: 'countries' })}
            </a>
          </Link>
        </li>
        <li>
          <Link href="/operators">
            <a className={!hideActive ? this.setActive(['/operators', '/operators-detail']) : ''}>
              {this.props.intl.formatMessage({ id: 'operators' })}
            </a>
          </Link>
        </li>
        <li>
          <Link href="/observations">
            <a className={!hideActive ? this.setActive(['/observations']) : ''}>
              {this.props.intl.formatMessage({ id: 'observations' })}
            </a>
          </Link>
        </li>
        <li>
          <Link href="/help">
            <a className={!hideActive ? this.setActive(['/help']) : ''}>
              {this.props.intl.formatMessage({ id: 'help' })}
            </a>
          </Link>
        </li>
        <li>
          <Link href="/about">
            <a className={!hideActive ? this.setActive(['/about']) : ''}>
              {this.props.intl.formatMessage({ id: 'about' })}
            </a>
          </Link>
        </li>
        <li>
          <Link href="/terms">
            <a className={!hideActive ? this.setActive(['/terms']) : ''}>
              {this.props.intl.formatMessage({ id: 'terms' })}
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
  className: PropTypes.string,
  intl: intlShape.isRequired
};

export default injectIntl(NavigationList);
