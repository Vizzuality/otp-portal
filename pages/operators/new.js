import React from 'react';
import PropTypes from 'prop-types';

// Redux
import withTracker from 'components/layout/with-tracker';

// Intl
import withIntl from 'hoc/with-intl';
import { intlShape } from 'react-intl';

// Components
import Layout from 'components/layout/layout';
import StaticHeader from 'components/ui/static-header';
import NewOperator from 'components/operators/new';

class OperatorsNew extends React.Component {
  static async getInitialProps({ url }) {
    return { url };
  }

  render() {
    const { url } = this.props;

    return (
      <Layout
        title={this.props.intl.formatMessage({ id: 'new.operators' })}
        description={this.props.intl.formatMessage({ id: 'new.operators.description' })}
        url={url}
      >
        <StaticHeader
          title={this.props.intl.formatMessage({ id: 'new.operators' })}
          background="/static/images/static-header/bg-help.jpg"
        />

        <NewOperator />

      </Layout>
    );
  }
}

OperatorsNew.propTypes = {
  url: PropTypes.shape({}).isRequired,
  intl: intlShape.isRequired
};


export default withTracker(withIntl(OperatorsNew));
