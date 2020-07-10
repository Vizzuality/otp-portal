import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import trim from 'lodash/trim';

// Intl
import { injectIntl, intlShape } from 'react-intl';

class FMUAACTemplatePopup extends PureComponent {
  static propTypes = {
    intl: intlShape.isRequired,
    layers: PropTypes.array
  };

  render() {
    const { layers } = this.props;

    const fmu = layers.find(l => l.id === 'fmusdetail');
    const aac = layers.find(l => l.id === 'aac-cog' || l.id === 'aac-cod' || l.id === 'aac-cmr');

    return (
      <div className="c-layer-popup">
        {!!fmu && <h3>{fmu.data.data.fmu_name}</h3>}

        {!!aac && (!!trim(aac.data.data.period_val) || aac.data.data.nom_aac) &&
          <ul className="layer-popup--list">
            {!!trim(aac.data.data.nom_aac) && <li>Name: {aac.data.data.nom_aac}</li>}
            {!!trim(aac.data.data.period_val) && <li>Period: {aac.data.data.period_val}</li>}
          </ul>
        }
      </div>
    );
  }
}

export default injectIntl(FMUAACTemplatePopup);
