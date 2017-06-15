import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import Link from 'next/link';
import NavigationList from 'components/ui/navigation-list';

export default class Header extends React.Component {
  /**
   * HELPERS
   * - setTheme
   * - setActive
  */
  setTheme() {
    const { url } = this.props;

    return classnames({
      '-theme-default': (url.pathname !== '/'),
      '-theme-home': (url.pathname === '/')
    });
  }

  render() {
    return (
      <header className={`c-header ${this.setTheme()}`}>
        <div className="l-container">
          <div className="header-container">
            <h1 className="header-logo">
              <Link prefetch href="/">
                <a>Open Timber Portal</a>
              </Link>
            </h1>
            <nav className="header-nav">
              <NavigationList url={this.props.url} className="header-nav-list" />
            </nav>
          </div>
        </div>
      </header>
    );
  }
}

Header.propTypes = {
  url: PropTypes.object.isRequired
};
