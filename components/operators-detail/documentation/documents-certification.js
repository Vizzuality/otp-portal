import React from 'react';
import PropTypes from 'prop-types';
import isEmpty from 'lodash/isEmpty';

// Redux
import { connect } from 'react-redux';
import { injectIntl, intlShape } from 'react-intl';

import { getOperator } from 'modules/operators-detail';

// Components
import DocCard from 'components/ui/doc-card';
import DocCardUpload from 'components/ui/doc-card-upload';

import { getContractSignatureDocumentation } from 'selectors/operators-detail/documentation';

function DocumentsCertification(props) {
  const { intl, doc, user, id } = props;
  const { status } = doc;

  const isLogged =
    (user && user.role === 'admin') ||
    (user &&
      (user.role === 'operator' || user.role === 'holding') &&
      user.operator_ids &&
      user.operator_ids.includes(+id));

  if (!isLogged || isEmpty(doc)) {
    return null;
  }

  return (
    <div className="c-doc-license-agreement">
      <ul className="c-doc-gallery">
        <li className="doc-gallery-item">
          <header>
            <h3 className="c-title -proximanova -extrabig -uppercase">
              {intl.formatMessage({ id: 'operator-detail.license' })}
            </h3>
            <p>
              {intl.formatHTMLMessage({
                id: `operator-detail.license.${status}`,
              })}
            </p>
          </header>

          <div className="row l-row -equal-heigth">
            <div className="columns small-12">
              <DocCard
                {...doc}
                title={intl.formatMessage({ id: 'operator-detail.license' })}
                properties={{
                  type: 'operator',
                  id,
                }}
                layout={{
                  info: false,
                  annexes: false,
                }}
                onChange={() => props.getOperator(id)}
              />

              {((user && user.role === 'admin') ||
                (user &&
                  (user.role === 'operator' || user.role === 'holding') &&
                  user.operator_ids &&
                  user.operator_ids.includes(+id))) && (
                  <DocCardUpload
                    {...doc}
                    properties={{
                    type: 'operator',
                    id,
                  }}
                    buttons={{
                    add: true,
                    update: true,
                    delete: true,
                    not_required: false,
                  }}
                    user={user}
                    onChange={() => props.getOperator(id)}
                  />
              )}
            </div>
          </div>
        </li>
      </ul>
    </div>
  );
}

DocumentsCertification.defaultProps = {};

DocumentsCertification.propTypes = {
  doc: PropTypes.shape({}),
  id: PropTypes.string,
  user: PropTypes.object,
  intl: intlShape.isRequired,
  getOperator: PropTypes.func,
};

export default injectIntl(
  connect(
    (state) => ({
      user: state.user,
      doc: getContractSignatureDocumentation(state),
    }),
    { getOperator }
  )(DocumentsCertification)
);
