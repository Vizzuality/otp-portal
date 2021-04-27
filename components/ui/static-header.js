import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';

class StaticHeader extends React.Component {
  static propTypes = {
    title: PropTypes.string.isRequired,
    subtitle: PropTypes.string,
    Component: PropTypes.oneOfType([PropTypes.element, PropTypes.bool]),
    background: PropTypes.string.isRequired,
    tabs: PropTypes.bool,
    logo: PropTypes.string,
    className: PropTypes.string,
  };

  static defaultProptypes = {
    title: '',
    subtitle: '',
    Component: null,
    background: '',
    tabs: false,
    logo: '',
    className: null,
  };

  render() {
    const {
      title,
      subtitle,
      background,
      Component,
      tabs,
      logo,
      className,
    } = this.props;
    const customClasses = classnames({
      '-tabs': tabs,
      '-logo': !!logo,
      [className]: !!className,
    });

    return (
      <div
        className={`c-static-header ${customClasses}`}
        style={{
          backgroundImage: `url(${background})`,
        }}
      >
        {tabs ? (
          <div className="wrapper">
            <div className="container">
              {logo && (
                <div className="logo-container">
                  <img
                    src={`${
                      process.env.NODE_ENV !== 'production'
                        ? process.env.OTP_API
                        : ''
                    }${logo}`}
                    alt={`${title} logo`}
                    className="logo"
                  />
                </div>
              )}

              <h2>{title}</h2>
              <h3>{subtitle}</h3>

              {!!Component && (
                <div className="static-header-component">{Component}</div>
              )}
            </div>
          </div>
        ) : (
          <div>
            <h2>{title}</h2>
            <h3>{subtitle}</h3>
          </div>
        )}
      </div>
    );
  }
}

export default StaticHeader;
