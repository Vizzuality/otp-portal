import React from 'react';

// Intl
import { injectIntl, intlShape } from 'react-intl';

import { HOW_OTP_WORKS_HELP } from 'constants/help';

// Components
import Card from 'components/ui/card';

function Gallery1(props) {
  return (
    <div className="c-gallery">
      <h2 className="c-title">
        {props.intl.formatMessage({ id: 'help.tabs.howto' })}
      </h2>

      <div className="row l-row">
        {HOW_OTP_WORKS_HELP.slice(0, 3).map((article, i) => {
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

Gallery1.propTypes = {
  intl: intlShape.isRequired
};

export default injectIntl(Gallery1);
