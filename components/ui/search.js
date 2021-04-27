import React from 'react';
import PropTypes from 'prop-types';

// Redux
import { connect } from 'react-redux';

// Next
import Router from 'next/router';

// Intl
import { intlShape, injectIntl } from 'react-intl';

// Utils
import { logEvent } from 'utils/analytics';

// Other libraries
import Fuse from 'fuse.js';
import classnames from 'classnames';

// Components
import Icon from 'components/ui/icon';

// Constants
import { SEARCH_OPTIONS } from 'constants/general';

class Search extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      results: [],
      value: '',
      active: false,
      index: 0
    };

    this.item = {};

    // Bindings
    this.onClose = this.onClose.bind(this);
    this.onKeyUp = this.onKeyUp.bind(this);
    this.onWindowClick = this.onWindowClick.bind(this);
    this.onWindowKeyUp = this.onWindowKeyUp.bind(this);
  }

  componentWillUpdate(nextProps, nextState) {
    if (nextState.active !== this.state.active) {
      if (nextState.active) {
        this.addListeners();
      } else {
        this.removeListeners();
      }
    }
  }

  componentWillUnmount() {
    this.removeListeners();
  }

  /**
   * WINDOW LISTENERS
   * - onWindowClick
   * - onWindowKeyUp
  */

  onWindowClick() {
    // TODO: check that you have clicked outside the result container
    if (false) {
      this.onClose();
    }
  }

  onWindowKeyUp(e) {
    switch (e.keyCode) {
      // Arrow up
      case 38:
        this.setIndexByDirection('up');
        break;
      // Arrow down
      case 40:
        this.setIndexByDirection('down');
        break;
      // Enter
      case 13:
        this.onChangeRoute();
        break;
      // ESC
      case 27:
        this.onClose();
        break;

      default: return false;
    }

    return false;
  }

  /**
   * UI EVENTS
   * - onKeyUp
   * - onClose
   * - onChangeRoute
  */
  onClose() {
    if (this.state.active) {
      this.setState({
        results: [],
        value: '',
        active: false,
        index: 0
      });
      this.input.value = '';
      this.removeListeners();
    }
  }

  onKeyUp(e) {
    const { value } = this.state;
    const currentValue = e.currentTarget.value;
    const isNewValue = currentValue !== value;
    const active = currentValue !== '';

    if (isNewValue) {
      const fuse = new Fuse(this.props.list, this.props.options);
      const result = fuse.search(currentValue);

      this.setState({
        index: 0,
        value: e.currentTarget.value,
        results: result.slice(0, 8),
        active
      });
    }
  }

  onChangeRoute = () => {
    const item = this.item[this.state.index];

    if (item) {
      const id = item.dataset.id;

      const location = {
        pathname: '/operators/detail',
        query: { id }
      };
      this.onClose();
      Router
        .push(location, `/operators/${id}`)
          .then(() => window.scrollTo(0, 0));

      logEvent('Search', 'User completes search', item.text);
    }
  }

  setIndexByDirection(direction) {
    const { index, results } = this.state;
    let newIndex = index;

    switch (direction) {
      case 'up':
        newIndex = (index === 0) ? results.length - 1 : index - 1;
        break;
      case 'down':
        newIndex = (index === results.length - 1) ? 0 : index + 1;
        break;

      default:
        console.info('No direction provided');
    }

    this.setIndex(newIndex);
  }

  setIndex(index) {
    this.setState({ index });
  }

  /**
   * HELPERS
   * - addListeners
   * - removeListeners
  */
  addListeners() {
    window.addEventListener('click', this.onWindowClick);
    window.addEventListener('keyup', this.onWindowKeyUp);
  }

  removeListeners() {
    window.removeEventListener('click', this.onWindowClick);
    window.removeEventListener('keyup', this.onWindowKeyUp);
  }

  render() {
    const { active, results } = this.state;

    const resultsClass = classnames({
      'results-container': true,
      '-active': active
    });

    return (
      <div className={`c-search ${this.props.theme}`}>
        <div className="search">
          {!!active &&
            <button
              className="c-button -clean"
              onClick={this.onClose}
            >
              <Icon name="icon-cross" />
            </button>

          }

          {!active &&
            <Icon name="icon-search" />
          }

          <input
            ref={(input) => { this.input = input; }}
            type="text"
            size={this.props.intl.formatMessage({ id: 'search.operators' }).length + 5}
            placeholder={this.props.intl.formatMessage({ id: 'search.operators' })}
            onKeyUp={this.onKeyUp}
          />
        </div>
        <div className={resultsClass}>
          <div className="results">
            <ul>
              {results.length ?
                results.map((op, i) => {
                  const activeClass = classnames({
                    '-active': this.state.index === i
                  });

                  return (
                    <li
                      key={op.id}
                      className={activeClass}
                      onMouseOver={() => { this.setIndex(i); }}
                    >
                      <a
                        ref={(n) => { this.item[i] = n; }}
                        data-id={op.id}
                        onClick={() => this.onChangeRoute()}
                      >
                        {op.name}
                      </a>

                    </li>
                  );
                }) :
                <li>{this.props.intl.formatMessage({ id: 'noresults' })}</li>
              }
            </ul>
          </div>
        </div>
      </div>
    );
  }
}

Search.propTypes = {
  theme: PropTypes.string,
  list: PropTypes.array,
  intl: intlShape.isRequired,
  options: PropTypes.object
};

Search.defaultProps = {
  theme: '',
  list: [],
  options: SEARCH_OPTIONS
};

export default connect(
  state => ({
    list: state.operators.data
  })
)(injectIntl(Search));
