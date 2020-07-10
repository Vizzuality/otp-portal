import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import Tooltip from 'rc-tooltip/dist/rc-tooltip';

// Intl
import { injectIntl, intlShape } from 'react-intl';

import groupBy from 'lodash/groupBy';

class CertificationsTd extends React.Component {
  static defaultProps = {
    name: '',
    fmus: [],
    observations: [],
    obs_per_visit: 0
  };

  static propTypes = {
    intl: intlShape.isRequired,
    name: PropTypes.string,
    fmus: PropTypes.array,
    observations: PropTypes.array,
    obs_per_visit: PropTypes.number
  };

  render() {
    const { intl, name, fmus, observations, obs_per_visit: obsPerVisit } = this.props;

    const observationsPerFMU = groupBy(observations, 'fmu-id');

    return (
      <Fragment>
        {!!obsPerVisit &&
          <Tooltip
            placement="bottom"
            overlay={
              <div className="c-observations-td">
                <ul>
                  {Object.keys(observationsPerFMU).map(k => {
                    const fmu = fmus.find(f => +f.id === +k);
                    if (!fmu) {
                      return (
                        <li key={name}>
                          {name}: {observationsPerFMU[k].length}
                        </li>
                      );
                    }

                    return (
                      <li key={fmu.name}>
                        {fmu.name}: {observationsPerFMU[k].length}
                      </li>
                    );
                  })}
                </ul>
              </div>
            }
            overlayClassName="c-tooltip no-pointer-events"
          >
            <span>{obsPerVisit}</span>
          </Tooltip>
        }
        {!obsPerVisit && (
          <div className="stoplight-dot -state-0}" />
        )}
      </Fragment>
    );
  }
}


export default injectIntl(CertificationsTd);
