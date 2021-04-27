import React from 'react';
import isEmpty from 'lodash/isEmpty';

// Next
import Router from 'next/router';

// Redux
import { connect } from 'react-redux';
import { getUserOperator } from 'modules/user';

import withTracker from 'components/layout/with-tracker';

// Intl
import withIntl from 'hoc/with-intl';
import { intlShape } from 'react-intl';

// Components
import Layout from 'components/layout/layout';
import StaticHeader from 'components/ui/static-header';
import EditOperator from 'components/operators/edit';
import Spinner from 'components/ui/spinner';

class OperatorsEdit extends React.Component {
  static async getInitialProps({ store, url }) {
    const { user } = store.getState();

    if (user.operator_ids) {
      await store.dispatch(getUserOperator(user.operator_ids[0]));
    }
    return { url };
  }

  /**
   * COMPONENT LIFECYCLE
  */
  componentDidMount() {
    const { user } = this.props;

    if (!user.operator_ids) {
      const location = {
        pathname: '/'
      };
      Router.push(location, '/');
    }
  }

  componentWillReceiveProps(nextProps) {
    // // Get user operator
    if (!nextProps.user.operator_ids) {
      const location = {
        pathname: '/'
      };
      Router.push(location, '/');
    }
  }

  render() {
    const { url, user, userOperator } = this.props;

    if (!user.operator_ids) {
      return null;
    }

    return (
      <Layout
        title={this.props.intl.formatMessage({ id: 'edit.operators' })}
        description={this.props.intl.formatMessage({ id: 'edit.operators.description' })}
        url={url}
      >
        <StaticHeader
          title={this.props.intl.formatMessage({ id: 'edit.operators' })}
          background="/static/images/static-header/bg-help.jpg"
        />

        {userOperator && userOperator.loading &&
          <Spinner isLoading={userOperator.loading} className="-light -fixed" />
        }

        {userOperator && !isEmpty(userOperator.data) &&
          <EditOperator
            operator={userOperator.data}
          />
        }
      </Layout>
    );
  }
}

OperatorsEdit.propTypes = {
  intl: intlShape.isRequired
};


export default withTracker(withIntl(connect(

  state => ({
    user: state.user,
    userOperator: state.user.userOperator
  }),
  { getUserOperator }
)(OperatorsEdit)));
