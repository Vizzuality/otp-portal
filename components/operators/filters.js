import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';

import modal from 'services/modal';

// Utils
import { logEvent } from 'utils/analytics';

// Redux
import { connect } from 'react-redux';
import { setFilters } from 'modules/operators-ranking';

// Intl
import { injectIntl, intlShape } from 'react-intl';

// Components
import Select from 'react-select';
import Icon from 'components/ui/icon';
import RankingModal from 'components/ui/ranking-modal';

const FILTERS_REFS = [
  {
    key: 'country',
    name: 'Country',
    type: 'select',
    placeholder: 'All Countries'
  },
  {
    key: 'certification',
    name: 'Certifications',
    type: 'select',
    placeholder: 'All certifications'
  },
  {
    key: 'operator',
    name: 'Producer',
    type: 'input',
    placeholder: 'Search producer'
  }
];

class OperatorsFilters extends React.Component {
  static defaultProps = {
    className: ''
  };

  static propTypes = {
    intl: intlShape.isRequired,
    filters: PropTypes.object,
    options: PropTypes.object,
    className: PropTypes.string,
    setFilters: PropTypes.func
  };

  setSelect(opts, key) {
    const filter = {};
    filter[key] = opts.map(opt => opt.value || opt);

    if (opts.length) {
      logEvent('Producers', `Filter ranking ${key}`, opts.map(opt => opt.label).join(', '));
    }

    this.props.setFilters(filter);
  }

  setSearch(value, key) {
    const filter = {};
    filter[key] = value;

    this.props.setFilters(filter);
  }

  renderFiltersSelects() {
    const { options, filters } = this.props;

    return FILTERS_REFS.map((f) => {
      const value = options[f.key] ?
        options[f.key].filter(opt => filters[f.key] ?
          filters[f.key].includes(opt.value) :
          false) :
        [];

      return (
        <div key={f.key} className="columns medium-4 small-12">
          <div className="field">
            <div className="c-select">
              <h3 className="title">
                {this.props.intl.formatMessage({ id: `filter.${f.key}` })}
              </h3>

              {f.type === 'select' &&
                <Select
                  multi
                  instanceId={f.key}
                  name={f.key}
                  options={options[f.key].map(o => ({
                    ...o,
                    label: this.props.intl.formatMessage({ id: o.label })
                  }))}
                  className={value.length ? '-filled' : ''}
                  value={value}
                  placeholder={this.props.intl.formatMessage({ id: `filter.${f.key}.placeholder` })}
                  onChange={opts => this.setSelect(opts, f.key)}
                />
              }

              {f.type === 'input' &&
                <div className="search">
                  <input
                    type="search"
                    placeholder={this.props.intl.formatMessage({ id: 'search.operators' })}
                    className="search-input"
                    value={filters[f.key]}
                    onChange={e => this.setSearch(e.currentTarget.value, f.key)}
                  />

                  {!!filters[f.key] &&
                    <button
                      className="search-remove"
                      onClick={() => {
                        this.setSearch('', f.key);
                      }}
                    >
                      <Icon name="icon-cross" className="-smaller" />
                    </button>
                  }
                </div>
              }
            </div>
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
      <aside className={`c-filters-operators ${classNames}`}>
        <div className="filters-container">

          <h3 className="c-title -big -light">
            {this.props.intl.formatMessage({ id: 'transparency_ranking' })}

            <button
              className="c-button -clean"
              onClick={() => {
                modal.toggleModal(true, {
                  children: RankingModal
                });
                logEvent('Producers', 'Info', 'Ranking menu');
              }}
            >
              <Icon name="icon-info" className="-small" />
            </button>
          </h3>

          <div className="filters-content">
            <div className="l-row row">
              {this.renderFiltersSelects()}
            </div>
          </div>
        </div>
      </aside>
    );
  }
}


export default connect(
  state => ({
    filters: state.operatorsRanking.filters.data,
    options: state.operatorsRanking.filters.options
  }),
  {
    setFilters
  }
)(injectIntl(OperatorsFilters));
