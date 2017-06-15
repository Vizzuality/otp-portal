import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';

export default class StaticSection extends React.Component {

  setPosition() {
    const { position } = this.props;

    return classnames({
      '-top': position.top,
      '-right': position.right,
      '-bottom': position.bottom,
      '-left': position.left
    });
  }

  setJustify() {
    const { position } = this.props;

    return classnames({
      'align-right': position.right
    });
  }

  render() {
    const { children, background, column } = this.props;

    return (
      <div
        className="c-static-section"
        style={{
          backgroundImage: background ? `url(${background})` : 'none'
        }}
      >
        {this.props.map && this.props.map.component &&
          <div className="c-map-container -absolute" type="full">
            <this.props.map.component {...this.props.map.props} />
          </div>
        }

        <div className={`c-static-box ${this.setPosition()}`}>
          <div className="l-container">
            <div className={`row collapse ${this.setJustify()}`}>
              <div className={`columns small-12 medium-${column}`}>
                {children}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

StaticSection.defaultProps = {
  position: { top: true, left: true },
  column: 12
};

StaticSection.propTypes = {
  children: PropTypes.any.isRequired,
  background: PropTypes.string,
  map: PropTypes.any,
  position: PropTypes.object,
  column: PropTypes.number
};
