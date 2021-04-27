import React from 'react';
import PropTypes from 'prop-types';
import Link from 'next/link';

// Utils
import { encode } from 'utils/general';

export default function Popup(props) {
  const { title, operator, list, id, fmu_type: fmuType } = props;

  const parse = (v) => {
    if (!v || v === 'null') { return '-'; }

    return v;
  };

  return (
    <div className="c-popup">
      <h2 className="c-title -extrabig">{parse(title)}</h2>

      {list && !!list.length &&
        <dl className="dl">
          {list.map(item =>
            <div
              className="dc"
              key={item.label}
            >
              <dt className="dt">{item.label}:</dt>
              <dd className="dd">{parse(item.value)}</dd>
            </div>
          )}
        </dl>
      }

      {list && operator && operator.id &&
        <Link href={{ pathname: '/operators/detail', query: { id: operator.id, subtab: fmuType || 'fmu', tab: 'documentation', fmuId: id } }} as={`/operators/${operator.id}/documentation?fmuId=${id}&subtab=${fmuType || 'fmu'}`}>
          <a className="c-button -tertiary -fullwidth -ellipsis -small">
            Documentation
          </a>
        </Link>
      }

      {id &&
        <Link href={{ pathname: '/observations', query: { filters: encode({ fmu_id: [id] }) } }}>
          <a className="c-button -tertiary -fullwidth -ellipsis -small">
            Observations
          </a>
        </Link>
      }

      {operator && operator.id &&
        <Link href={{ pathname: '/operators/detail', query: { id: operator.id } }} as={`/operators/${operator.id}`}>
          <a className="c-button -tertiary -fullwidth -ellipsis -small">
            {operator.name}
          </a>
        </Link>
      }

    </div>
  );
}

Popup.propTypes = {
  id: PropTypes.string,
  title: PropTypes.string,
  fmu_type: PropTypes.string,
  operator: PropTypes.object,
  list: PropTypes.array
};
