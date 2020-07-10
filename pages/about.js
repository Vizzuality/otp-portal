import React from 'react';
import PropTypes from 'prop-types';
import sortBy from 'lodash/sortBy';

// Redux
import { connect } from 'react-redux';
import { getPartners } from 'modules/partners';
import { getDonors } from 'modules/donors';

import withTracker from 'components/layout/with-tracker';

// Intl
import withIntl from 'hoc/with-intl';
import { intlShape } from 'react-intl';

// Components
import Layout from 'components/layout/layout';
import StaticHeader from 'components/ui/static-header';
import PartnerCard from 'components/ui/partner-card';

class AboutPage extends React.Component {
  static async getInitialProps({ url, store }) {
    await store.dispatch(getPartners());
    await store.dispatch(getDonors());

    return { url };
  }

  render() {
    const { partners, donors, url } = this.props;
    const prioritisedDonors = sortBy(donors.data, 'priority') || donors.data;

    return (
      <Layout
        title="About"
        description="About description..."
        url={url}
      >
        <StaticHeader
          title={this.props.intl.formatMessage({ id: 'about.title' })}
          background="/static/images/static-header/bg-about.jpg"
        />

        <div className="c-section">
          <div className="l-container">
            <article
              className="c-article"
            >
              <div className="row l-row">
                <div className="columns small-12 medium-8">
                  <header>
                    <h2 className="c-title">{this.props.intl.formatMessage({ id: 'about.background' })}</h2>
                  </header>
                  <div className="content">
                    <div className="description">
                      <p>{this.props.intl.formatMessage({ id: 'about.background.description1' })}</p>
                      <p>{this.props.intl.formatMessage({ id: 'about.background.description2' })}</p>
                    </div>
                  </div>
                </div>
              </div>
            </article>

            <article
              className="c-article"
            >
              <div className="row l-row">
                <div className="columns small-12 medium-6">
                  <header>
                    <h2 className="c-title">{this.props.intl.formatMessage({ id: 'about.contactus' })}</h2>
                  </header>
                  <div className="content">
                    <div className="description">
                      <p>{this.props.intl.formatMessage({ id: 'about.contactus.description1' })}</p>
                    </div>
                  </div>
                </div>
              </div>
            </article>

            <article
              className="c-article"
            >
              <div className="row l-row">
                <div className="columns small-12">
                  <header>
                    <h2 className="c-title">{this.props.intl.formatMessage({ id: 'about.partners' })}</h2>
                  </header>

                  <div className="content">
                    <div className="description">
                      <p>{this.props.intl.formatMessage({ id: 'about.partners.description1' })}</p>
                      <p>{this.props.intl.formatMessage({ id: 'about.partners.description2' })}</p>
                    </div>

                    <div className="row l-row -equal-heigth">
                      {partners.data.map(p => (
                        <div
                          className={'columns small-12 medium-6 large-4'}
                          key={p.id}
                        >
                          <PartnerCard
                            {...p}
                          />
                        </div>
                        ))}
                    </div>

                  </div>
                </div>
              </div>
            </article>

            <article
              className="c-article"
            >
              <div className="row l-row">
                <div className="columns small-12">
                  <header>
                    <h2 className="c-title">{this.props.intl.formatMessage({ id: 'about.donors' })}</h2>
                  </header>

                  <div className="content">
                    <div className="description">
                      <p>{this.props.intl.formatMessage({ id: 'about.donors.description1' })}</p>
                    </div>
                  </div>

                  <div className="row l-row -equal-heigth">
                    {prioritisedDonors.map(d => (
                      <div
                        className={'columns small-12 medium-6 large-4'}
                        key={d.id}
                      >
                        <PartnerCard
                          {...d}
                        />
                      </div>
                      ))}
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

AboutPage.propTypes = {
  url: PropTypes.shape({}).isRequired,
  partners: PropTypes.shape({}).isRequired,
  donors: PropTypes.shape({}).isRequired,
  intl: intlShape.isRequired
};

export default withTracker(withIntl(connect(
  state => ({
    partners: state.partners,
    donors: state.donors
  }),
  { getPartners, getDonors }
)(AboutPage)));
