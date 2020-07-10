import React from 'react';
import PropTypes from 'prop-types';

// Redux
import { connect } from 'react-redux';

import { store } from 'store';
import withTracker from 'components/layout/with-tracker';

// Intl
import withIntl from 'hoc/with-intl';
import { intlShape } from 'react-intl';

// Components
import Layout from 'components/layout/layout';
import StaticHeader from 'components/ui/static-header';

class TermsPage extends React.Component {
  static async getInitialProps({ url }) {
    return { url };
  }

  render() {
    const { url } = this.props;

    return (
      <Layout
        title="Terms of service"
        description="Terms of service"
        url={url}
      >
        <StaticHeader
          title={this.props.intl.formatMessage({ id: 'terms.title' })}
          background="/static/images/static-header/bg-about.jpg"
        />

        <div className="c-section">
          <div className="l-container">
            <article
              className="c-article"
            >
              <div className="row l-row">
                <div className="columns small-12 medium-8">
                  <div className="content">
                    <div className="description">
                      <p>
                        <strong>{this.props.intl.formatMessage({ id: 'terms.contact.address1' })}</strong> <br />
                        <strong>{this.props.intl.formatMessage({ id: 'terms.contact.address2' })}</strong> <br />
                        <strong>{this.props.intl.formatMessage({ id: 'terms.contact.address3' })}</strong>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </article>

            <article
              className="c-article"
            >
              <div className="row l-row">
                <div className="columns small-12 medium-8">
                  <header>
                    <h2 className="c-title">{this.props.intl.formatMessage({ id: 'terms.privacy' })}</h2>
                  </header>
                  <div className="content">
                    <div className="description">
                      <p>{this.props.intl.formatMessage({ id: 'terms.privacy.pharagraph1' })}</p>
                      <p>{this.props.intl.formatMessage({ id: 'terms.privacy.pharagraph2' })}</p>
                      <p>{this.props.intl.formatMessage({ id: 'terms.privacy.pharagraph3' })}</p>
                    </div>
                  </div>
                </div>
              </div>
            </article>

            <article
              className="c-article"
            >
              <div className="row l-row">
                <div className="columns small-12 medium-8">
                  <header>
                    <h2 className="c-title">{this.props.intl.formatMessage({ id: 'terms.service' })}</h2>
                  </header>
                  <div className="content">
                    <div className="description">
                      <p>{this.props.intl.formatMessage({ id: 'terms.pharagraph1' })}</p>
                      <p>{this.props.intl.formatMessage({ id: 'terms.pharagraph2' })}</p>
                    </div>
                  </div>
                </div>
              </div>
            </article>

            <article
              className="c-article"
            >
              <div className="row l-row">
                <div className="columns small-12 medium-8">
                  <header>
                    <h2 className="c-title">{this.props.intl.formatMessage({ id: 'terms.usage' })}</h2>
                  </header>
                  <div className="content">
                    <div className="description">
                      <p>{this.props.intl.formatMessage({ id: 'terms.usage.pharagraph1' })}</p>
                      <ol>
                        <li>{this.props.intl.formatMessage({ id: 'terms.usage.listitem1' })}</li>
                        <li>{this.props.intl.formatMessage({ id: 'terms.usage.listitem2' })}</li>
                        <li>{this.props.intl.formatMessage({ id: 'terms.usage.listitem3' })}</li>
                      </ol>
                    </div>
                  </div>
                </div>
              </div>
            </article>

            <article
              className="c-article"
            >
              <div className="row l-row">
                <div className="columns small-12 medium-8">
                  <header>
                    <h2 className="c-title">{this.props.intl.formatMessage({ id: 'terms.accounts' })}</h2>
                  </header>
                  <div className="content">
                    <div className="description">
                      <ol>
                        <li>{this.props.intl.formatMessage({ id: 'terms.accounts.listitem1' })}</li>
                        <li>{this.props.intl.formatMessage({ id: 'terms.accounts.listitem2' })}</li>
                        <li>{this.props.intl.formatMessage({ id: 'terms.accounts.listitem3' })}</li>
                        <li>{this.props.intl.formatMessage({ id: 'terms.accounts.listitem4' })}</li>
                        <li>{this.props.intl.formatMessage({ id: 'terms.accounts.listitem5' })}</li>
                      </ol>
                    </div>
                  </div>
                </div>
              </div>
            </article>

            <article
              className="c-article"
            >
              <div className="row l-row">
                <div className="columns small-12 medium-8">
                  <header>
                    <h2 className="c-title">{this.props.intl.formatMessage({ id: 'terms.third-party' })}</h2>
                  </header>
                  <div className="content">
                    <div className="description">
                      <ol>
                        <li>{this.props.intl.formatMessage({ id: 'terms.third-party.listitem1' })}</li>
                        <li>{this.props.intl.formatMessage({ id: 'terms.third-party.listitem2' })}</li>
                        <li>{this.props.intl.formatMessage({ id: 'terms.third-party.listitem3' })}</li>
                      </ol>
                    </div>
                  </div>
                </div>
              </div>
            </article>

            <article
              className="c-article"
            >
              <div className="row l-row">
                <div className="columns small-12 medium-8">
                  <header>
                    <h2 className="c-title">{this.props.intl.formatMessage({ id: 'terms.submitted-content' })}</h2>
                  </header>
                  <div className="content">
                    <div className="description">
                      <ol>
                        <li>{this.props.intl.formatMessage({ id: 'terms.submitted-content.listitem1' })}</li>
                        <li>{this.props.intl.formatMessage({ id: 'terms.submitted-content.listitem2' })}</li>
                        <li>{this.props.intl.formatMessage({ id: 'terms.submitted-content.listitem3' })}</li>
                      </ol>
                    </div>
                  </div>
                </div>
              </div>
            </article>

            <article
              className="c-article"
            >
              <div className="row l-row">
                <div className="columns small-12 medium-8">
                  <header>
                    <h2 className="c-title">{this.props.intl.formatMessage({ id: 'terms.disclaimers' })}</h2>
                  </header>
                  <div className="content">
                    <div className="description">
                      <ol>
                        <li>{this.props.intl.formatMessage({ id: 'terms.disclaimers.listitem1' })}</li>
                        <li>{this.props.intl.formatMessage({ id: 'terms.disclaimers.listitem2' })}</li>
                        <li>{this.props.intl.formatMessage({ id: 'terms.disclaimers.listitem3' })}</li>
                      </ol>
                    </div>
                  </div>
                </div>
              </div>
            </article>

            <article
              className="c-article"
            >
              <div className="row l-row">
                <div className="columns small-12 medium-8">
                  <header>
                    <h2 className="c-title">{this.props.intl.formatMessage({ id: 'terms.compliance' })}</h2>
                  </header>
                  <div className="content">
                    <div className="description">
                      <p>{this.props.intl.formatMessage({ id: 'terms.compliance.pharagraph1' })}</p>
                      <ol>
                        <li>{this.props.intl.formatMessage({ id: 'terms.compliance.listitem1' })}</li>
                        <li>{this.props.intl.formatMessage({ id: 'terms.compliance.listitem2' })}</li>
                        <li>{this.props.intl.formatMessage({ id: 'terms.compliance.listitem3' })}</li>
                      </ol>
                    </div>
                  </div>
                </div>
              </div>
            </article>

            <article
              className="c-article"
            >
              <div className="row l-row">
                <div className="columns small-12 medium-8">
                  <header>
                    <h2 className="c-title">{this.props.intl.formatMessage({ id: 'terms.additional' })}</h2>
                  </header>
                  <div className="content">
                    <div className="description">
                      <ol>
                        <li>{this.props.intl.formatMessage({ id: 'terms.additional.listitem1' })}</li>
                        <li>{this.props.intl.formatMessage({ id: 'terms.additional.listitem2' })}</li>
                        <li>{this.props.intl.formatMessage({ id: 'terms.additional.listitem3' })}</li>
                        <li>{this.props.intl.formatMessage({ id: 'terms.additional.listitem4' })}</li>
                        <li>{this.props.intl.formatMessage({ id: 'terms.additional.listitem5' })}</li>
                      </ol>
                    </div>
                  </div>
                </div>
              </div>
            </article>
          </div>
        </div>
      </Layout>
    );
  }

}

TermsPage.propTypes = {
  url: PropTypes.shape({}).isRequired,
  intl: intlShape.isRequired
};

export default withTracker(withIntl(connect(
  store
)(TermsPage)));
