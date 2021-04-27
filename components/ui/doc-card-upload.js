import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import moment from 'moment';

import { connect } from 'react-redux';

import { getOperatorDocumentationDate } from 'selectors/operators-detail/documentation';

// Intl
import { injectIntl, intlShape } from 'react-intl';

// Services
import DocumentationService from 'services/documentationService';
import modal from 'services/modal';

// Components
import DocModal from 'components/ui/doc-modal';
import Spinner from 'components/ui/spinner';

class DocCardUpload extends React.Component {
  constructor(props) {
    super(props);

    // STATE
    this.state = {
      deleteLoading: false,
    };

    // BINDINGS
    this.triggerAddFile = this.triggerAddFile.bind(this);
    this.triggerEditFile = this.triggerEditFile.bind(this);
    this.triggerDeleteFile = this.triggerDeleteFile.bind(this);
    this.triggerNotRequiredFile = this.triggerNotRequiredFile.bind(this);

    // SERVICE
    this.documentationService = new DocumentationService({
      authorization: props.user.token,
    });
  }

  /**
   * UI EVENTS
   * - triggerAddFile
   * - triggerNotRequiredFile
   * - triggerEditFile
   * - triggerDeleteFile
   */
  triggerAddFile(e) {
    e && e.preventDefault();

    modal.toggleModal(true, {
      children: DocModal,
      childrenProps: {
        ...this.props,
        onChange: () => {
          this.props.onChange && this.props.onChange();
        },
      },
    });
  }

  triggerNotRequiredFile(e) {
    e && e.preventDefault();

    modal.toggleModal(true, {
      children: DocModal,
      childrenProps: {
        ...this.props,
        notRequired: true,
        onChange: () => {
          this.props.onChange && this.props.onChange();
        },
      },
    });
  }

  triggerEditFile(e) {
    e && e.preventDefault();

    modal.toggleModal(true, {
      children: DocModal,
      childrenProps: {
        ...this.props,
        notRequired: !!this.props.reason,
        onChange: () => {
          this.props.onChange && this.props.onChange();
        },
      },
    });
  }

  triggerDeleteFile(e) {
    e && e.preventDefault();
    const { docId } = this.props;

    this.setState({ deleteLoading: true });

    this.documentationService.deleteDocument(docId)
      .then(() => {
        this.setState({ deleteLoading: false });
        this.props.onChange && this.props.onChange();
      })
      .catch((err) => {
        this.setState({ deleteLoading: false });
        console.error(err);
      });
  }

  render() {
    const { status, buttons, date } = this.props;
    const { deleteLoading } = this.state;
    const currentDate = moment(new Date());
    const selectedDate = moment(date);
    const isEditable =
      currentDate.year() === selectedDate.year() &&
      currentDate.month() === selectedDate.month() &&
      currentDate.dayOfYear() === selectedDate.dayOfYear();
    const btnTooltip = !isEditable
      ? 'Please select the most recent date on the filters to edit any document'
      : null;

    const classNames = classnames({
      [`-${status}`]: !!status,
    });

    return (
      <div className={`c-doc-card-upload ${classNames}`}>
        {(status === 'doc_valid' ||
          status === 'doc_invalid' ||
          status === 'doc_pending' ||
          status === 'doc_expired') && (
          <ul>
            {buttons.update && (
              <li>
                <button
                  title={btnTooltip}
                  disabled={!isEditable}
                  onClick={this.triggerEditFile}
                  className="c-button -small -primary"
                >
                  {this.props.intl.formatMessage({ id: 'edit' })}
                </button>
              </li>
            )}

            {buttons.delete && (
              <li>
                <button
                  title={btnTooltip}
                  disabled={!isEditable}
                  onClick={this.triggerDeleteFile}
                  className="c-button -small -primary"
                >
                  {this.props.intl.formatMessage({ id: 'delete' })}
                  <Spinner
                    isLoading={deleteLoading}
                    className="-tiny -transparent"
                  />
                </button>
              </li>
            )}
          </ul>
        )}
        {status === 'doc_not_provided' && (
          <ul>
            {buttons.add && (
              <li>
                <button
                  title={btnTooltip}
                  disabled={!isEditable}
                  onClick={this.triggerAddFile}
                  className="c-button -small -secondary"
                >
                  {this.props.intl.formatMessage({ id: 'add-file' })}
                </button>
              </li>
            )}

            {buttons.not_required && (
              <li>
                <button
                  title={btnTooltip}
                  disabled={!isEditable}
                  onClick={this.triggerNotRequiredFile}
                  className="c-button -small -primary"
                >
                  {this.props.intl.formatMessage({ id: 'notrequired-file' })}
                </button>
              </li>
            )}
          </ul>
        )}

        {status === 'doc_not_required' && (
          <ul>
            {buttons.not_required && (
              <li>
                <button
                  title={btnTooltip}
                  disabled={!isEditable}
                  onClick={this.triggerDeleteFile}
                  className="c-button -small -primary"
                >
                  {this.props.intl.formatMessage({ id: 'required-file' })}
                </button>
              </li>
            )}
          </ul>
        )}
      </div>
    );
  }
}

DocCardUpload.propTypes = {
  status: PropTypes.string,
  user: PropTypes.object,
  docId: PropTypes.string,
  onChange: PropTypes.func,
  buttons: PropTypes.shape({}),
  date: PropTypes.string,
  intl: intlShape.isRequired,
};

DocCardUpload.defaultProps = {
  buttons: {
    add: true,
    update: true,
    delete: true,
    not_required: true,
  },
};

export default injectIntl(
  connect(
    (state) => ({
      date: getOperatorDocumentationDate(state),
    }),
    {}
  )(DocCardUpload)
);
