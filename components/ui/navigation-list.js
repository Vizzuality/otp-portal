import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';

import Link from 'next/link';
import Dropdown, {
  DropdownTrigger,
  DropdownContent,
} from 'react-simple-dropdown';

import { injectIntl, intlShape } from 'react-intl';

class NavigationList extends React.Component {
  setActive(pathname) {
    const { url } = this.props;
    return classnames({
      '-active': pathname.includes(url.pathname),
    });
  }

  render() {
    const { hideActive, className } = this.props;
    const classNames = classnames({
      'c-navigation-list': true,
      [className]: !!className,
    });

    return (
      <ul className={classNames}>
        {hideActive && (
          <li>
            <Dropdown className="c-language-dropdown">
              <DropdownTrigger>
                <div className="header-nav-list-item">
                  <span>
                    {this.props.intl.formatMessage({ id: 'select_language' })}
                  </span>
                </div>
              </DropdownTrigger>

              <DropdownContent>
                <ul className="language-dropdown-list">
                  <li className="language-dropdown-list-item">
                    <a href="?language=en-GB">English</a>
                  </li>
                  <li className="language-dropdown-list-item">
                    <a href="?language=fr-FR">Français</a>
                  </li>
                  <li className="language-dropdown-list-item">
                    <a href="?language=zh-CN">中文</a>
                  </li>
                  <li className="language-dropdown-list-item">
                    <a href="?language=ja-JP">日本語</a>
                  </li>
                  <li className="language-dropdown-list-item">
                    <a href="?language=ko-KR">한국어</a>
                  </li>
                  <li className="language-dropdown-list-item">
                    <a href="?language=vi-VN">Tiếng Việt</a>
                  </li>
                </ul>
              </DropdownContent>
            </Dropdown>
          </li>
        )}
        {/* <li>
          <Link href="/countries">
            <a
              className={
                !hideActive
                  ? this.setActive(['/countries', '/countries-detail'])
                  : ''
              }
            >
              {this.props.intl.formatMessage({ id: 'countries' })}
            </a>
          </Link>
        </li> */}
        <li>
          <Dropdown
            className="c-account-dropdown"
            ref={(d) => {
              this.dropdown = d;
            }}
          >
            <DropdownTrigger>
              <div
                className={classnames(
                  'header-nav-list-item',
                  !hideActive ? this.setActive(['/operators', '/database']) : ''
                )}
              >
                <span>
                  {this.props.intl.formatMessage({ id: 'operators' })}
                </span>
              </div>
            </DropdownTrigger>

            <DropdownContent>
              <ul className="header-dropdown-list">
                <li className="header-dropdown-list-item">
                  <Link href="/operators">
                    <a>
                      {this.props.intl.formatMessage({
                        id: 'transparency_ranking',
                      })}
                    </a>
                  </Link>
                </li>
                <li className="header-dropdown-list-item">
                  <Link href="/database">
                    <a>
                      {this.props.intl.formatMessage({
                        id: 'producers_documents_database',
                      })}
                    </a>
                  </Link>
                </li>
              </ul>
            </DropdownContent>
          </Dropdown>
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
        {hideActive && (
          <li>
            <Link href="/terms">
              <a className={!hideActive ? this.setActive(['/terms']) : ''}>
                {this.props.intl.formatMessage({ id: 'terms' })}
              </a>
            </Link>
          </li>
        )}
        {hideActive && (
          <li>
            <Link href="/newsletter">
              <a className={!hideActive ? this.setActive(['/newsletter']) : ''}>
                {this.props.intl.formatMessage({ id: 'newsletter' })}
              </a>
            </Link>
          </li>
        )}
      </ul>
    );
  }
}

NavigationList.propTypes = {
  url: PropTypes.object,
  hideActive: PropTypes.bool,
  className: PropTypes.string,
  intl: intlShape.isRequired,
};

export default injectIntl(NavigationList);
