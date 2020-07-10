import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import isEqual from 'lodash/isEqual';

import { injectIntl, intlShape } from 'react-intl';
import Select from 'react-select';


class Filters extends React.Component {

  componentDidUpdate(prevProps) {
    const { options, filters } = this.props;
    const { options: prevOptions } = prevProps;

    if (!isEqual(options, prevOptions)) {
      this.props.filtersRefs.map((f) => {
        const value = options[f.key] ?
          options[f.key].filter(opt => filters[f.key] ?
            filters[f.key].includes(opt.value) :
            false) :
          [];

        this.setFilter(value, f.key);
      });
    }
  }

  setFilter(selected, key) {
    const filter = {};
    filter[key] = selected.map((opt) => {
      const isVal = (opt.value !== null && typeof opt.value !== 'undefined');
      return (isVal) ? opt.value : opt;
    });

    this.props.setFilters(filter);
    // this.props.logFilter(key, filter[key]);
  }


  renderFiltersSelects() {
    const { options, filters } = this.props;

    return this.props.filtersRefs.map((f) => {
      const value = options[f.key] ?
        options[f.key].filter(opt => filters[f.key] ?
          filters[f.key].includes(opt.value) :
          false) :
        [];

      let opts = options[f.key];

      if (f.key === 'validation_status') {
        opts = opts.map(o => ({
          ...o,
          label: this.props.intl.formatMessage({ id: `observations.status-${o.id}` }),
          name: this.props.intl.formatMessage({ id: `observations.status-${o.id}` })
        }));
      }

      return (
        <div key={f.key} className="field">
          <div className="c-select">
            <h3 className="title">
              {this.props.intl.formatMessage({ id: `filter.${f.key}` })}
            </h3>
            <Select
              instanceId={f.key}
              name={f.key}
              options={opts}
              multi
              className={value.length ? '-filled' : ''}
              value={value}
              placeholder={this.props.intl.formatMessage({ id: `filter.${f.key}.placeholder` })}
              onChange={selected => {
                this.setFilter(selected, f.key);
              }}
            />
          </div>
        </div>
      );
    });
  }

  render() {
    const { className } = this.props;

    const classNames = classnames({
      [className]: !!className
    });

    return (
      <aside className={`c-filters ${classNames}`}>
        <div className="filters-content">
          <h2 className="c-title -light">
            {this.props.intl.formatMessage({ id: 'filter.title' })}
          </h2>
          {this.renderFiltersSelects()}
        </div>
      </aside>
    );
  }
}

Filters.propTypes = {
  filters: PropTypes.object,
  filtersRefs: PropTypes.array,
  options: PropTypes.object,
  intl: intlShape.isRequired,
  className: PropTypes.string,
  // Actions
  setFilters: PropTypes.func,
  logFilter: PropTypes.func
};

Filters.defaultProps = {
  options: {}
};

export default injectIntl(Filters);
