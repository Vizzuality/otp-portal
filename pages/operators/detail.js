import React from 'react';
import PropTypes from 'prop-types';

// Utils
import { HELPERS_DOC } from 'utils/documentation';
import { logEvent } from 'utils/analytics';

// Intl
import withIntl from 'hoc/with-intl';
import { intlShape } from 'react-intl';

// Constants
import { TABS_OPERATORS_DETAIL } from 'constants/operators-detail';

// Selectors
import { getParsedObservations } from 'selectors/operators-detail/observations';
import { getParsedDocumentation } from 'selectors/operators-detail/documentation';
import { getParsedTimeline } from 'selectors/operators-detail/timeline';

// Redux
import { connect } from 'react-redux';
import {
  getOperator,
  getOperatorDocumentation,
  getOperatorTimeline,
  setOperatorDocumentationDate,
} from 'modules/operators-detail';
import { getGladMaxDate } from 'modules/operators-detail-fmus';
import withTracker from 'components/layout/with-tracker';

import Link from 'next/link';

// Components
import Layout from 'components/layout/layout';
import StaticHeader from 'components/ui/static-header';
import Tabs from 'components/ui/tabs';
import Spinner from 'components/ui/spinner';

// Operator Details Tabs
import OperatorsDetailOverview from 'components/operators-detail/overview';
import OperatorsDetailDocumentation from 'components/operators-detail/documentation';
import OperatorsDetailObservations from 'components/operators-detail/observations';
import OperatorsDetailFMUs from 'components/operators-detail/fmus';

class OperatorsDetail extends React.Component {
  static async getInitialProps({ url, store }) {
    const { operatorsDetail, operatorsDetailFmus } = store.getState();

    if (!operatorsDetailFmus.layersSettings.glad) {
      await store.dispatch(getGladMaxDate());
    }

    if (url.query.tab === 'documentation') {
      await store.dispatch(setOperatorDocumentationDate(new Date()));
    }

    if (operatorsDetail.data.id !== url.query.id) {
      await store.dispatch(getOperator(url.query.id));
      await store.dispatch(getOperatorDocumentation(url.query.id));
      await store.dispatch(getOperatorTimeline(url.query.id));
    }

    return { url };
  }

  /**
   * COMPONENT LIFECYCLE
   */
  componentDidMount() {
    const { url } = this.props;
    this.props.getOperatorDocumentation(url?.query?.id);
  }

  componentDidUpdate(prevProps) {
    const prevDate = prevProps?.operatorsDetail?.date;
    const newDate = this.props?.operatorsDetail?.date;

    if (prevDate !== newDate) {
      const { url } = this.props;
      this.props.getOperatorDocumentation(url?.query?.id);
    }
  }

  componentWillReceiveProps(nextProps) {
    const { url } = this.props;
    const { url: nextUrl } = nextProps;

    if (url.query.tab !== nextUrl.query.tab) {
      const { tab } = nextUrl.query || 'overview';
      logEvent('Producers', 'Change tab', tab);
    }
  }

  /**
   * HELPERS
   * - getTabOptions
   */
  getTabOptions() {
    const operatorsDetail = this.props.operatorsDetail.data;

    return TABS_OPERATORS_DETAIL.map((tab) => {
      let number;
      switch (tab.value) {
        case 'documentation': {
          number = `${HELPERS_DOC.getPercentage(operatorsDetail)}%`;
          break;
        }

        default: {
          const tabData = operatorsDetail[tab.value];
          number = tabData ? tabData.length : null;
        }
      }

      return {
        ...tab,
        label: this.props.intl.formatMessage({ id: tab.label }),
        number,
      };
    });
  }

  render() {
    const {
      url,
      user,
      operatorsDetail,
      operatorObservations,
      operatorDocumentation,
      operatorTimeline,
    } = this.props;
    const id = url.query.id;
    const tab = url.query.tab || 'overview';
    const logoPath = operatorsDetail.data.logo
      ? operatorsDetail.data.logo.url
      : '';

    return (
      <Layout
        title={operatorsDetail.data.name || '-'}
        description="Forest operator's name description..."
        url={url}
      >
        <Spinner isLoading={operatorsDetail.loading} className="-fixed" />

        <StaticHeader
          title={operatorsDetail.data.name || '-'}
          subtitle={this.props.intl.formatMessage(
            { id: 'operator-detail.subtitle' },
            {
              rank: operatorsDetail.data['country-doc-rank'],
              rankCount: operatorsDetail.data['country-operators'],
              country:
                !!operatorsDetail.data.country &&
                operatorsDetail.data.country.name,
            }
          )}
          background="/static/images/static-header/bg-operator-detail.jpg"
          Component={
            user &&
            (user.role === 'operator' || user.role === 'holding') &&
            user.operator_ids &&
            user.operator_ids.includes(+id) && (
              <Link href="/operators/edit">
                <a className="c-button -secondary -small">
                  {this.props.intl.formatMessage({ id: 'update.profile' })}
                </a>
              </Link>
            )
          }
          tabs
          logo={logoPath !== '/api/placeholder.png' ? logoPath : ''}
        />

        <Tabs
          href={{
            pathname: url.pathname,
            query: { id },
            as: `/operators/${id}`,
          }}
          options={this.getTabOptions()}
          defaultSelected={tab}
          selected={tab}
        />

        {tab === 'overview' && (
          <OperatorsDetailOverview
            operatorsDetail={operatorsDetail}
            operatorDocumentation={operatorDocumentation}
            operatorObservations={operatorObservations}
            url={url}
          />
        )}

        {tab === 'documentation' && (
          <OperatorsDetailDocumentation
            operatorsDetail={operatorsDetail}
            operatorDocumentation={operatorDocumentation}
            operatorTimeline={operatorTimeline}
            url={url}
          />
        )}

        {tab === 'observations' && (
          <OperatorsDetailObservations
            operatorsDetail={operatorsDetail}
            operatorObservations={operatorObservations}
            url={url}
          />
        )}

        {tab === 'fmus' && (
          <OperatorsDetailFMUs operatorsDetail={operatorsDetail} url={url} />
        )}
      </Layout>
    );
  }
}

OperatorsDetail.propTypes = {
  url: PropTypes.object.isRequired,
  operatorsDetail: PropTypes.object,
  operatorObservations: PropTypes.array,
  operatorDocumentation: PropTypes.array,
  operatorTimeline: PropTypes.array,
  user: PropTypes.shape({}),
  intl: intlShape.isRequired,
};

export default withTracker(
  withIntl(
    connect(
      (state) => ({
        user: state.user,
        operatorsDetail: state.operatorsDetail,
        operatorObservations: getParsedObservations(state),
        operatorDocumentation: getParsedDocumentation(state),
        operatorTimeline: getParsedTimeline(state),
      }),
      {
        getOperator,
        getOperatorDocumentation,
        getOperatorTimeline,
      }
    )(OperatorsDetail)
  )
);
