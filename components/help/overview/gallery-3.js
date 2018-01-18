import React from 'react';

// Intl
import { injectIntl, intlShape } from 'react-intl';

// Components
import { FAQS_HELP } from 'constants/help';

// Components
import Card from 'components/ui/card';

function Gallery3(props) {
  return (
    <div className="c-gallery">
      <h2 className="c-title">
        {props.intl.formatMessage({ id: 'help.tabs.faqs' })}
      </h2>

      <div className="row l-row">
        {FAQS_HELP.slice(0, 3).map((article, i) => {
          const theme = (i === 0) ? '-secondary' : '-primary';

          return (
            <div
              key={article.id}
              className="columns small-12 medium-4"
            >
              <Card
                theme={theme}
                title={props.intl.formatMessage({ id: article.title })}
                description={props.intl.formatMessage({ id: article.description })}
                link={article.link}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

Gallery3.propTypes = {
  intl: intlShape.isRequired
};

export default injectIntl(Gallery3);
