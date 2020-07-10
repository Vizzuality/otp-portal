import React from 'react';
import PropTypes from 'prop-types';
import { StickyContainer, Sticky } from 'react-sticky';
import Spinner from 'components/ui/spinner';
import Html from 'components/html';

// Intl
import { injectIntl, intlShape } from 'react-intl';

let MoveTo;

class HelpTools extends React.Component {

  componentDidMount() {
    MoveTo = require('moveto'); //eslint-disable-line

    this.moveTo = new MoveTo({
      tolerance: 50,
      duration: 500,
      easing: 'easeOutQuart'
    });

    if (this.props.url.query.article) {
      setTimeout(() => {
        this.triggerScrollTo(`#${this.props.url.query.article}`);
      }, 250);
    }
  }

  componentDidUpdate() {
    if (this.props.url.query.article) {
      setTimeout(() => {
        this.triggerScrollTo(`#${this.props.url.query.article}`);
      }, 250);
    }
  }

  triggerScrollTo(id) {
    const target = document.querySelector(id);
    this.moveTo.move(target);
  }

  render() {
    const { data, loading, error } = this.props.tools;

    return (
      <div
        className="c-section"
      >
        <Spinner className="-transparent -small" isLoading={loading || error} />
        <div className="l-container">
          <StickyContainer>
            <div className="row l-row">
              <div className="columns small-12 medium-3">
                <Sticky>
                  {
                    ({ style }) => (
                      <aside className="c-aside" style={style}>
                        <h3>
                          {this.props.intl.formatMessage({ id: 'help.tabs.legislation' })}
                        </h3>
                        <nav>
                          <ul>
                            {data.map(tutorial =>
                              <li
                                key={tutorial.id}
                                onClick={() => this.triggerScrollTo(`#tutorial-article-${tutorial.id}`)}
                              >
                                {tutorial.name}
                              </li>
                            )}
                          </ul>
                        </nav>
                      </aside>
                    )
                  }
                </Sticky>
              </div>

              <div className="columns small-12 medium-8 medium-offset-1">
                {data.map(tutorial =>
                  <article
                    key={tutorial.id}
                    id={`tutorial-article-${tutorial.id}`}
                    className="c-article"
                  >
                    <header>
                      <h2 className="c-title">
                        {tutorial.name}
                      </h2>
                    </header>
                    <div className="content">
                      <div className="description">
                        <Html html={tutorial.description} />
                      </div>
                    </div>
                  </article>
                )}
              </div>
            </div>
          </StickyContainer>
        </div>
      </div>
    );
  }
}

HelpTools.propTypes = {
  intl: intlShape.isRequired,
  url: PropTypes.object.isRequired,
  tools: PropTypes.object
};

export default injectIntl(HelpTools);
