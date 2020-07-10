import React from 'react';
import PropTypes from 'prop-types';

// Intl
import { injectIntl, intlShape } from 'react-intl';

// Components
import Spinner from 'components/ui/spinner';

// Components
import Card from 'components/ui/card';

function Gallery1(props) {
  const { data, loading, error } = props.tutorials;

  return (
    <div className="c-gallery">
      <h2 className="c-title">
        {props.intl.formatMessage({ id: 'help.tabs.tutorials' })}
      </h2>

      <div className="gallery-content">
        <div className="row l-row">
          <Spinner className="-transparent -small" isLoading={loading || error} />

          {data.slice(0, 3).map(tutorial => (
            <div
              key={tutorial.id}
              className="columns small-12 medium-4"
            >
              <Card
                theme="-primary"
                title={tutorial.name}
                description={tutorial.description}
                link={{
                  label: props.intl.formatMessage({ id: 'help.tabs.howto.post1.link.label' }),
                  href: `/help/tutorials?article=tutorial-article-${tutorial.id}`
                }}
              />
            </div>
          ))}

        </div>

        {data.length === 0 &&
          <p>
            {props.intl.formatMessage({ id: 'help.tabs.howto.overview.no_data' }) }
          </p>
        }
      </div>
    </div>
  );
}

Gallery1.propTypes = {
  intl: intlShape.isRequired,
  tutorials: PropTypes.object
};

export default injectIntl(Gallery1);
