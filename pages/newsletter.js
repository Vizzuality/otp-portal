import React from 'react';
import PropTypes from 'prop-types';

import { getCountries } from 'modules/countries';
import withTracker from 'components/layout/with-tracker';

// Intl
import withIntl from 'hoc/with-intl';
import { intlShape } from 'react-intl';

// Components
import Layout from 'components/layout/layout';
import StaticHeader from 'components/ui/static-header';
import UserNewsLetterForm from 'components/users/newsletter';

class SignNewsletter extends React.Component {
  static async getInitialProps({ url, store }) {
    await store.dispatch(getCountries());

    return { url };
  }

  render() {
    const { url } = this.props;

    return (
      <Layout
        title={this.props.intl.formatMessage({ id: 'newsletter' })}
        description={this.props.intl.formatMessage({ id: 'newsletter' })}
        url={url}
      >
        <StaticHeader
          title={this.props.intl.formatMessage({ id: 'newsletter' })}
          background="/static/images/static-header/bg-help.jpg"
        />

        <UserNewsLetterForm />

      </Layout>
    );
  }
}

SignNewsletter.propTypes = {
  url: PropTypes.shape({}).isRequired,
  intl: intlShape.isRequired
};


export default withTracker(withIntl((SignNewsletter)));
