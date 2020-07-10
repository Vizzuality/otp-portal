import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

import { injectIntl, intlShape } from 'react-intl';

import Spinner from 'components/ui/spinner';

class LegendAnalysisLoss extends PureComponent {
  static propTypes = {
    analysis: PropTypes.shape({}).isRequired,
    intl: intlShape
  }

  render() {
    const { analysis, intl } = this.props;
    const { data, loading, error } = analysis;

    return (
      <div className="c-legend-analysis">
        {loading && <Spinner className="-transparent -tiny -relative" isLoading={loading} />}

        {!loading && error &&
          'Oops!! There was an error during the analysis.'
        }

        {!loading && data &&
          intl.formatMessage({ id: 'analysis.loss' }, { alerts: data.loss.toLocaleString() })
        }
      </div>
    );
  }
}

export default injectIntl(LegendAnalysisLoss);
