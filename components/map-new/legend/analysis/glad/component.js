import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

import Spinner from 'components/ui/spinner';

import { injectIntl, intlShape } from 'react-intl';

class LegendAnalysisGLAD extends PureComponent {
  static propTypes = {
    activeLayer: PropTypes.shape({}).isRequired,
    analysis: PropTypes.shape({}).isRequired,
    intl: intlShape
  }

  render() {
    const { activeLayer, analysis, intl } = this.props;
    const { decodeParams } = activeLayer;
    const { startDate, trimEndDate } = decodeParams;
    const { data, loading, error } = analysis;

    return (
      <div className="c-legend-analysis">
        {loading && <Spinner className="-transparent -tiny -relative" isLoading={loading} />}

        {!loading && error &&
          'Oops!! There was an error during the analysis.'
        }

        {!loading && data &&
          intl.formatMessage({ id: 'analysis.glad' }, { alerts: data.value.toLocaleString(), startDate, trimEndDate })
        }
      </div>
    );
  }
}

export default injectIntl(LegendAnalysisGLAD);
