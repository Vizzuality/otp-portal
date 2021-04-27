import React from 'react';
import PropTypes from 'prop-types';

import { injectIntl, intlShape } from 'react-intl';

// Components
import TotalObservationsByOperatorByCategory from 'components/operators-detail/observations/by-category';

function Overview(props) {
  const { parsedObservations } = props;

  return (
    <div className="c-obs-overview">
      <h2 className="c-title">
        {props.intl.formatMessage({ id: 'overview_by_category' })}
      </h2>

      <TotalObservationsByOperatorByCategory
        data={parsedObservations}
        horizontal
      />
    </div>
  );
}

Overview.propTypes = {
  parsedObservations: PropTypes.array,
  intl: intlShape.isRequired,
};

export default injectIntl(Overview);
