/* eslint-disable max-len */
import React from 'react';
import PropTypes from 'prop-types';


// Intl
import { injectIntl, intlShape } from 'react-intl';

// Components
import Gallery1 from 'components/operators-detail/overview/gallery-1';
import TotalObservationsByOperatorByCategory from 'components/operators-detail/observations/by-category';

function OperatorsDetailOverview(props) {
  const { address, website } = props.operatorsDetail.data;

  return (
    <div
      className="c-section"
    >
      <div className="l-container">
        <Gallery1 {...props} />

        <article className="c-article">
          <header>
            <h2 className="c-title">
              {props.intl.formatMessage({ id: 'overview' })}
            </h2>
          </header>
          <div className="content">

            <div className="row l-row -equal-heigth">
              <div className="columns small-12 medium-8">
                <p className="description">
                  {props.operatorsDetail.data.details || props.intl.formatMessage({ id: 'operator-detail.overview.details_placeholder' })}
                </p>

                { (Boolean(address) || Boolean(website)) &&
                  <ul className="details-list">
                    { address &&
                      <li key="address" className="">
                        <span>
                          <strong>Adress:</strong>
                          <address>{address}</address>
                        </span>
                      </li>
                    }
                    { website &&
                      <li key="website" className="">
                        <strong>Website:</strong>
                        <a href={website} target="_blank" rel="noopener noreferrer">{website}</a>
                      </li>
                    }
                  </ul>
                }
              </div>
            </div>
          </div>

        </article>

        {/* CHARTS */}
        <article className="c-article">
          <header>
            <h2 className="c-title">
              {props.intl.formatMessage({ id: 'observations_by_category' })}
            </h2>
          </header>

          <div className="content">
            <TotalObservationsByOperatorByCategory data={props.operatorObservations} />
          </div>
        </article>
      </div>
    </div>
  );
}

OperatorsDetailOverview.propTypes = {
  operatorsDetail: PropTypes.object,
  operatorObservations: PropTypes.array,
  intl: intlShape.isRequired
};


export default injectIntl(OperatorsDetailOverview);
