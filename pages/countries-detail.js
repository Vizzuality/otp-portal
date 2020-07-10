import React from 'react';
import PropTypes from 'prop-types';

import * as Cookies from 'js-cookie';

// Toastr
import { toastr } from 'react-redux-toastr';

// Intl
import withIntl from 'hoc/with-intl';
import { intlShape } from 'react-intl';

// Selectors
import { getParsedDocumentation } from 'selectors/countries-detail/documentation';
import { getParsedObservations } from 'selectors/countries-detail/observations';

// Constants
import { TABS_COUNTRIES_DETAIL } from 'constants/countries-detail';

// Redux
import { connect } from 'react-redux';
import { getCountry, getCountryObservations, getCountryLinks, getCountryVPAs } from 'modules/countries-detail';
import withTracker from 'components/layout/with-tracker';

// Components
import Layout from 'components/layout/layout';
import StaticHeader from 'components/ui/static-header';
import Tabs from 'components/ui/tabs';
import Spinner from 'components/ui/spinner';

import CountriesDetailOverview from 'components/countries-detail/overview';
import CountriesDetailDocumentation from 'components/countries-detail/documentation';
import CountriesDetailObservations from 'components/countries-detail/observations';

class CountriesDetail extends React.Component {
  static async getInitialProps({ url, store }) {
    await store.dispatch(getCountry(url.query.id));
    await store.dispatch(getCountryObservations(url.query.id));
    await store.dispatch(getCountryLinks(url.query.id));
    await store.dispatch(getCountryVPAs(url.query.id));

    return { url };
  }

  // /**
  //  * COMPONENT LIFECYCLE
  // */
  componentDidMount() {
    // Set discalimer
    // if (!Cookies.get('country-detail.disclaimer')) {
    //   toastr.info(
    //     'Info',
    //     this.props.intl.formatMessage({ id: 'country-detail.disclaimer' }),
    //     {
    //       className: '-disclaimer',
    //       position: 'bottom-right',
    //       timeOut: 15000,
    //       onCloseButtonClick: () => {
    //         Cookies.set('country-detail.disclaimer', true);
    //       }
    //     }
    //   );
    // }
  }

  componentWillReceiveProps(nextProps) {
    const { url } = this.props;
    const { url: nextUrl } = nextProps;

    if (url.query.id !== nextUrl.query.id) {
      this.props.getCountry(nextUrl.query.id);
    }
  }

  /**
   * HELPERS
   * - getTabOptions
  */
  getTabOptions() {
    return TABS_COUNTRIES_DETAIL.map((tab) => {
      return {
        ...tab,
        label: this.props.intl.formatMessage({ id: tab.label })
      };
    });
  }

  render() {
    const { url, countriesDetail, countryDocumentation, countryObservations } = this.props;
    const id = url.query.id;
    const tab = url.query.tab || 'overview';

    return (
      <Layout
        title={countriesDetail.data.name || '-'}
        description="Country description..."
        url={url}
      >
        <Spinner isLoading={countriesDetail.loading} className="-fixed" />

        <StaticHeader
          title={countriesDetail.data.name || '-'}
          // subtitle={this.props.intl.formatMessage({ id: 'country.subtitle' }, {
          //   rank: countriesDetail.data['country-doc-rank'],
          //   rankCount: countriesDetail.data['country-operators'],
          //   country: !!countriesDetail.data.country && countriesDetail.data.country.name
          // })}
          background="/static/images/static-header/bg-operator-detail.jpg"
        />

        <Tabs
          href={{
            pathname: url.pathname,
            query: { id },
            as: `/countries/${id}`
          }}
          options={this.getTabOptions()}
          defaultSelected={tab}
          selected={tab}
        />

        {tab === 'overview' &&
          <CountriesDetailOverview
            countriesDetail={countriesDetail}
            countryDocumentation={countryDocumentation}
            countryObservations={countryObservations}
            url={url}
          />
        }


        {tab === 'documentation' &&
          <CountriesDetailDocumentation
            countriesDetail={countriesDetail}
            countryDocumentation={countryDocumentation}
            url={url}
          />
        }

        {tab === 'observations' &&
          <CountriesDetailObservations
            countriesDetail={countriesDetail}
            countryObservations={countryObservations}
            url={url}
          />
        }

      </Layout>
    );
  }

}

CountriesDetail.propTypes = {
  url: PropTypes.object.isRequired,
  countriesDetail: PropTypes.shape({}).isRequired,
  countryDocumentation: PropTypes.shape({}).isRequired,
  countryObservations: PropTypes.shape({}).isRequired,
  intl: intlShape.isRequired,

  getCountry: PropTypes.func.isRequired
};

export default withTracker(withIntl(connect(

  state => ({
    user: state.user,
    countriesDetail: state.countriesDetail,
    countryDocumentation: getParsedDocumentation(state),
    countryObservations: getParsedObservations(state)
  }),
  { getCountry }
)(CountriesDetail)));
