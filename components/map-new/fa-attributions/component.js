import React from 'react';

import ATTRIBUTIONS from './attributions';

export default function FAAttributions() {
  return (
    <div className="c-fa-attributions">
      {ATTRIBUTIONS.map(attr => (
        <div className="attributions--item">
          <h3>{attr.name}</h3>
          <ul>
            {attr.licenses.map(u => (
              <li>
                <a target="_blank" rel="noopener noreferrer" href={u.data}><h4>{u.name}</h4></a>
                <div className="attributions--copyright">{u.copyright}</div>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}


FAAttributions.propTypes = {
};
