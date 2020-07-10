import React from 'react';
import PropTypes from 'prop-types';
import { StickyContainer, Sticky } from 'react-sticky';
import Spinner from 'components/ui/spinner';
import Html from 'components/html';

// Intl
import { injectIntl, intlShape } from 'react-intl';

let MoveTo;

class HelpFaqs extends React.Component {

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
    const { data, loading, error } = this.props.faqs;

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
                          {this.props.intl.formatMessage({ id: 'help.tabs.faqs' })}
                        </h3>
                        <nav>
                          <ul>
                            {data.map(faq =>
                              <li
                                key={faq.id}
                                onClick={() => this.triggerScrollTo(`#faq-article-${faq.id}`)}
                              >
                                {faq.question}
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
                {data.slice(0, 3).map(faq =>
                  <article
                    key={faq.id}
                    id={`faq-article-${faq.id}`}
                    className="c-article"
                  >
                    <header>
                      <h2 className="c-title">
                        {faq.question}
                      </h2>
                    </header>
                    <div className="content">
                      <div className="description">
                        <Html html={faq.answer} />
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

HelpFaqs.propTypes = {
  intl: intlShape.isRequired,
  url: PropTypes.object.isRequired,
  faqs: PropTypes.object
};

export default injectIntl(HelpFaqs);
