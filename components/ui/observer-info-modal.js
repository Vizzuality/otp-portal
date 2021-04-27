import React from 'react';
import PropTypes from 'prop-types';

// Intl
import { injectIntl, intlShape } from 'react-intl';

class ObserverInfoModal extends React.Component {
  render() {
    const {
      intl,
      name,
      'information-email': informationEmail,
      'information-name': informationName,
      'information-phone': informationPhone,
      'data-email': dataEmail,
      'data-name': dataName,
      'data-phone': dataPhone

    } = this.props;

    return (
      <div className="c-observer-info-modal">
        <h3>{name}</h3>
        <div className="observer-info-modal--content">
          <div>
            <h4>{intl.formatMessage({ id: "information" })}</h4>
            <dl>
              <div className="observer-info-modal--list-item">
                <dt>{intl.formatMessage({ id: "name" })}</dt>
                <dd>{informationName || '-'}</dd>
              </div>
              <div className="observer-info-modal--list-item">
                <dt>{intl.formatMessage({ id: "email" })}:</dt>
                <dd>{informationEmail || '-'}</dd>
              </div>
              <div className="observer-info-modal--list-item">
                <dt>{intl.formatMessage({ id: "phone" })}</dt>
                <dd>{informationPhone || '-'}</dd>
              </div>
            </dl>
          </div>

          <div>
            <h4>{intl.formatMessage({ id: "data" })}</h4>
            <dl>
              <div className="observer-info-modal--list-item">
                <dt>{intl.formatMessage({ id: "name" })}</dt>
                <dd>{dataName || '-'}</dd>
              </div>
              <div className="observer-info-modal--list-item">
                <dt>{intl.formatMessage({ id: "email" })}:</dt>
                <dd>{dataEmail || '-'}</dd>
              </div>
              <div className="observer-info-modal--list-item">
                <dt>{intl.formatMessage({ id: "phone" })}</dt>
                <dd>{dataPhone || '-'}</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    );
  }
}

ObserverInfoModal.propTypes = {
  name: PropTypes.string,
  'information-email': PropTypes.string,
  'information-name': PropTypes.string,
  'information-phone': PropTypes.string,
  'data-email': PropTypes.string,
  'data-name': PropTypes.string,
  'data-phone': PropTypes.string,
  intl: intlShape.isRequired
};


export default injectIntl(ObserverInfoModal);
