import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import Link from 'next/link';

// Intl
import { injectIntl, intlShape } from 'react-intl';

import { format } from 'd3-format';
import moment from 'moment';

// Utils
import { encode } from 'utils/general';

class FMUTemplatePopup extends PureComponent {
  static propTypes = {
    layers: PropTypes.array.isRequired,
    intl: intlShape.isRequired
  };

  formatValue = (config, data) => {
    const { column, format: format_str, prefix = '', suffix = '', type } = config;
    let value = data[column];

    switch (type) {
      case 'date': {
        if (value && format_str) {
          value = moment(value).format(format_str);
        }

        break;
      }

      case 'number': {
        if (value && format_str) {
          value = format(format_str)(value);
        }

        break;
      }

      default: {
        value = this.props.intl.formatMessage({ id: data[column] || '-' });
      }
    }

    return `${prefix} ${value} ${suffix}`;
  }

  render() {
    const { layers, intl } = this.props;
    const activeInteractiveLayer = layers.find(l => l.id === 'fmus');
    const { interactionConfig, data } = activeInteractiveLayer;
    const { output } = interactionConfig;
    const { data: fmuData } = data;

    const { id, operator_id: operatorId, company_na: operatorName, fmu_type_label: fmuType, observations: fmuObservations } = fmuData;

    return (
      <div className="c-layer-popup">
        <h2 className="c-title -extrabig">
          {data.data.fmu_name}
        </h2>

        <table className="layer-popup--table">
          <tbody>
            {output.filter(o => !o.hidden).map(o => (
              <tr
                key={o.column}
                className="layer-popup--table-item"
              >
                <td className="layer-popup--list-dt">{intl.formatMessage({ id: o.label || o.column })}:</td>
                <td className="layer-popup--list-dd">{this.formatValue(o, fmuData)}</td>
              </tr>
              ))}
          </tbody>
        </table>

        {operatorId && operatorName &&
          <Link href={{ pathname: '/operators-detail', query: { id: operatorId, subtab: fmuType || 'fmu', tab: 'documentation', fmuId: id } }} as={`/operators/${operatorId}/documentation?fmuId=${id}&subtab=${fmuType || 'fmu'}`}>
            <a className="c-button -tertiary -fullwidth -ellipsis -small">
              {intl.formatMessage({ id: 'documentation' })}
            </a>
          </Link>
        }

        {id &&
          <Link href={{ pathname: '/observations', query: { filters: encode({ fmu_id: [id] }) } }}>
            <a className="c-button -tertiary -fullwidth -ellipsis -small">
              {intl.formatMessage({ id: 'observations' })} ({fmuObservations})
            </a>
          </Link>
        }

        {operatorId &&
          <Link href={{ pathname: '/operators-detail', query: { id: operatorId } }} as={`/operators/${operatorId}`}>
            <a className="c-button -tertiary -fullwidth -ellipsis -small">
              {operatorName}
            </a>
          </Link>
        }
      </div>
    );
  }
}

export default injectIntl(FMUTemplatePopup);
