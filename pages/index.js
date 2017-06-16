import React from 'react';
import PropTypes from 'prop-types';

// Redux
import withRedux from 'next-redux-wrapper';
import { store } from 'store';

// Constants
import { MAP_OPTIONS_HOME, MAP_LAYERS_HOME } from 'constants/home';

// Components
import Page from 'components/layout/page';
import Layout from 'components/layout/layout';
import StaticSection from 'components/ui/static-section';
import Card from 'components/ui/card';
import Map from 'components/map/map';

class HomePage extends Page {
  render() {
    const { url, session } = this.props;

    return (
      <Layout
        title="Home"
        description="Home description..."
        url={url}
        session={session}
      >
        {/* INTRO */}
        <StaticSection
          background="/static/images/home/bg-intro.jpg"
          position={{ bottom: true, left: true }}
          column={9}
        >
          <div className="c-intro">
            <h2>Incentivizing <span>legal timber</span> through better information sharing</h2>
          </div>
        </StaticSection>

        {/* SECTION A */}
        <StaticSection
          background="/static/images/home/bg-a.jpg"
          position={{ top: true, left: true }}
          column={4}
        >
          <Card
            theme="-secondary"
            letter="A"
            title="Operator transparency rankings"
            description="View the global transparency rankings of forest concession operators and refine search based on a specific country or by operator type"
            link={{
              label: 'Visualize rankings',
              href: '/operators'
            }}
          />
        </StaticSection>

        {/* SECTION B */}
        <StaticSection
          map={{
            component: Map,
            props: {
              mapOptions: MAP_OPTIONS_HOME,
              layers: MAP_LAYERS_HOME
            }
          }}
          position={{ top: true, right: true }}
          column={4}
        >
          <Card
            theme="-tertiary"
            letter="B"
            title="Operator profiles"
            description="Explore the profiles of specific operators, view documents of legal compliance provided and observations recorded by Independent Monitors (IMs)"
            link={{
              label: 'Explore operators',
              href: '/operators'
            }}
          />
        </StaticSection>

        {/* SECTION C */}
        <StaticSection
          background="/static/images/home/bg-c.jpg"
          position={{ top: true, left: true }}
          column={4}
        >
          <Card
            theme="-secondary"
            letter="C"
            title="Forest Management Units"
            description="Explore Forest Management Units (FMUs) and forest concessions operators by navigating the data through an interactive map"
            link={{
              label: 'Explore the map',
              href: '/operators'
            }}
          />
        </StaticSection>
      </Layout>
    );
  }
}

HomePage.propTypes = {
  session: PropTypes.object.isRequired
};

export default withRedux(
  store
)(HomePage);
