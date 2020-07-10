import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';

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
      deleteLoading: false
    };

    // BINDINGS
    this.triggerAddFile = this.triggerAddFile.bind(this);
    this.triggerEditFile = this.triggerEditFile.bind(this);
    this.triggerDeleteFile = this.triggerDeleteFile.bind(this);
    this.triggerNotRequiredFile = this.triggerNotRequiredFile.bind(this);

    // SERVICE
    this.documentationService = new DocumentationService({
      authorization: props.user.token
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
        }
      }
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
        }
      }
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
        }
      }
    });
  }

  triggerDeleteFile(e) {
    e && e.preventDefault();
    const { id } = this.props;

    this.setState({ deleteLoading: true });

    this.documentationService.deleteDocument(id)
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
    const { status, buttons } = this.props;
    const { deleteLoading } = this.state;

    const classNames = classnames({
      [`-${status}`]: !!status
    });

    return (
      <div className={`c-doc-card-upload ${classNames}`}>
        {(status === 'doc_valid' || status === 'doc_invalid' || status === 'doc_pending' || status === 'doc_expired') &&
          <ul>
            {buttons.update &&
              <li>
                <button onClick={this.triggerEditFile} className="c-button -small -primary">
                  {this.props.intl.formatMessage({ id: 'edit' })}
                </button>
              </li>
            }

            {buttons.delete &&
              <li>
                <button onClick={this.triggerDeleteFile} className="c-button -small -primary">
                  {this.props.intl.formatMessage({ id: 'delete' })}
                  <Spinner isLoading={deleteLoading} className="-tiny -transparent" />
                </button>
              </li>
            }
          </ul>
        }
        {status === 'doc_not_provided' &&
          <ul>
            {buttons.add &&
              <li>
                <button onClick={this.triggerAddFile} className="c-button -small -secondary">
                  {this.props.intl.formatMessage({ id: 'add-file' })}
                </button>
              </li>
            }

            {buttons.not_required &&
              <li>
                <button onClick={this.triggerNotRequiredFile} className="c-button -small -primary">
                  {this.props.intl.formatMessage({ id: 'notrequired-file' })}
                </button>
              </li>
            }
          </ul>
        }

        {status === 'doc_not_required' &&
          <ul>
            {buttons.not_required &&
              <li>
                <button onClick={this.triggerDeleteFile} className="c-button -small -primary">
                  {this.props.intl.formatMessage({ id: 'required-file' })}
                </button>
              </li>
            }
          </ul>
        }
      </div>
    );
  }
}

DocCardUpload.propTypes = {
  status: PropTypes.string,
  user: PropTypes.object,
  id: PropTypes.string,
  onChange: PropTypes.func,
  buttons: PropTypes.shape({}),
  intl: intlShape.isRequired
};

DocCardUpload.defaultProps = {
  buttons: {
    add: true,
    update: true,
    delete: true,
    not_required: true
  }
};

export default injectIntl(DocCardUpload)
