import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';

import Icon from 'components/ui/icon';

export default function Sidebar(props) {
  const { className, open, name, children, onToggle } = props;

  const classNames = classnames({
    [props.className]: !!className,
    '-open': open
  });

  return (
    <aside className={`l-sidebar c-sidebar ${classNames}`}>
      {onToggle &&
        <button
          className="sidebar--button"
          onClick={() => onToggle(!open)}
        >
          {!open &&
            <span className="sidebar--button-name">
              <span>{name}</span>
              <Icon name="icon-arrow-down" />
            </span>
          }
          {open &&
            <span className="sidebar--button-name">
              <Icon name="icon-cross" />
            </span>
          }
        </button>
      }

      <div className="l-sidebar-content">
        {children}
      </div>
    </aside>
  );
}

Sidebar.propTypes = {
  className: PropTypes.string,
  children: PropTypes.any,
  open: PropTypes.bool,
  name: PropTypes.string,
  onToggle: PropTypes.func
};

Sidebar.defaultProps = {
  open: true
};
