import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';

// Redux
import { connect } from 'react-redux';
import { getOperator } from 'modules/operators-detail';

// Intl
import { injectIntl, intlShape } from 'react-intl';


// Services
import modal from 'services/modal';
import DocumentationService from 'services/documentationService';

// Components
import Field from 'components/form/Field';
import Input from 'components/form/Input';
import Textarea from 'components/form/Textarea';
import File from 'components/form/File';
import Spinner from 'components/ui/spinner';

// Constants
const FORM_ELEMENTS = {
  elements: {
  },
  validate() {
    const elements = this.elements;
    Object.keys(elements).forEach((k) => {
      elements[k].validate();
    });
  },
  isValid() {
    const elements = this.elements;
    const valid = Object.keys(elements)
      .map(k => elements[k].isValid())
      .filter(v => v !== null)
      .every(element => element);

    return valid;
  }
};

class DocModal extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      form: {
        startDate: '',
        expireDate: '',
        file: '',
        reason: ''
      },
      submitting: false,
      errors: []
    };

    // Bindings
    this.onChange = this.onChange.bind(this);
    this.onSubmit = this.onSubmit.bind(this);

    // Services
    this.documentationService = new DocumentationService({
      authorization: props.user.token
    });
  }

  /**
   * UI EVENTS
   * - onChange
   * - onSubmit
  */
  onChange(value) {
    const form = Object.assign({}, this.state.form, value);
    this.setState({ form });
  }

  onSubmit(e) {
    e && e.preventDefault();

    // Validate the form
    FORM_ELEMENTS.validate();

    // Set a timeout due to the setState function of react
    setTimeout(() => {
      // Validate all the inputs on the current step
      const valid = FORM_ELEMENTS.isValid(this.state.form);

      if (valid) {
        const { type } = this.props;

        // Start the submitting
        this.setState({ submitting: true });

        this.documentationService.saveDocument({
          url: type,
          type: 'POST',
          body: this.getBody()
        })
          .then(() => {
            this.setState({ submitting: false, errors: [] });
            this.props.onChange && this.props.onChange();
            modal.toggleModal(false);
          })
          .catch((err) => {
            console.error(err);
            this.setState({ submitting: false, errors: err });
          });
      } else {
        // toastr.error('Error', 'Fill all the required fields');
      }
    }, 0);
  }


  /**
   * HELPERS
   * - getBody
  */
  getBody() {
    const { requiredDocId, type, operatorId, fmu } = this.props;

    return {
      data: {
        type,
        attributes: {
          current: true,
          'operator-id': operatorId,
          'required-operator-document-id': requiredDocId,
          'start-date': this.state.form.startDate,
          'expire-date': this.state.form.expireDate,
          attachment: this.state.form.file,
          reason: this.state.form.reason,
          ...fmu && { 'fmu-id': fmu.id }
        }
      }
    };
  }


  render() {
    const { submitting, errors } = this.state;
    const { title, notRequired } = this.props;
    const submittingClassName = classnames({
      '-submitting': submitting
    });

    return (
      <div className="c-login">
        <Spinner isLoading={submitting} className="-light" />

        <h2 className="c-title -extrabig">
          {title}
        </h2>

        <form className="c-form" onSubmit={this.onSubmit} noValidate>
          <fieldset className="c-field-container">

            <div className="l-row row">
              <div className="columns medium-6 small-12">
                {/* DATE */}
                <Field
                  ref={(c) => { if (c) FORM_ELEMENTS.elements.startDate = c; }}
                  onChange={value => this.onChange({ startDate: value })}
                  validations={['required']}
                  className="-fluid"
                  properties={{
                    name: 'startDate',
                    label: notRequired ?
                      this.props.intl.formatMessage({ id: 'start_date' }) :
                      this.props.intl.formatMessage({ id: 'doc.start_date' }),
                    type: 'date',
                    required: true,
                    default: this.state.form.startDate
                  }}
                >
                  {Input}
                </Field>
              </div>
              <div className="columns medium-6 small-12">
                {/* DATE */}
                <Field
                  ref={(c) => { if (c) FORM_ELEMENTS.elements.expireDate = c; }}
                  onChange={value => this.onChange({ expireDate: value })}
                  className="-fluid"
                  properties={{
                    name: 'expireDate',
                    label: notRequired ?
                      this.props.intl.formatMessage({ id: 'expire_date' }) :
                      this.props.intl.formatMessage({ id: 'doc.expiry_date' }),
                    type: 'date',
                    default: this.state.form.expireDate
                  }}
                >
                  {Input}
                </Field>
              </div>
            </div>

            {/* DOCUMENT */}
            {!notRequired &&
              <div className="l-row row">
                <div className="columns small-12">
                  <Field
                    ref={(c) => { if (c) FORM_ELEMENTS.elements.file = c; }}
                    onChange={value => this.onChange({ file: value })}
                    validations={['required']}
                    className="-fluid"
                    properties={{
                      name: 'file',
                      label: this.props.intl.formatMessage({ id: 'file' }),
                      required: true,
                      default: this.state.form.file
                    }}
                  >
                    {File}
                  </Field>
                </div>
              </div>
            }

            {/* REASON */}
            {notRequired &&
              <div className="l-row row">
                <div className="columns small-12">
                  <Field
                    ref={(c) => { if (c) FORM_ELEMENTS.elements.reason = c; }}
                    onChange={value => this.onChange({ reason: value })}
                    className="-fluid"
                    validations={['required']}
                    properties={{
                      name: 'reason',
                      label: this.props.intl.formatMessage({ id: 'why-is-it-not-required' }),
                      required: true,
                      rows: '6',
                      default: this.state.form.reason
                    }}
                  >
                    {Textarea}
                  </Field>
                </div>
              </div>
            }
          </fieldset>

          {!!errors.length &&
            errors.map(e => e.title)
          }

          <ul className="c-field-buttons">
            <li>
              <button
                type="button"
                name="commit"
                className="c-button -primary -expanded"
                onClick={() => modal.toggleModal(false)}
              >
                {this.props.intl.formatMessage({ id: 'cancel' })}
              </button>
            </li>
            <li>
              <button
                type="submit"
                name="commit"
                disabled={submitting}
                className={`c-button -secondary -expanded ${submittingClassName}`}
              >
                {this.props.intl.formatMessage({
                  id: (notRequired) ? 'submit' : 'upload-file'
                })}
              </button>
            </li>
          </ul>
        </form>
      </div>
    );
  }
}

DocModal.propTypes = {
  title: PropTypes.string,
  requiredDocId: PropTypes.string,
  type: PropTypes.string,
  operatorId: PropTypes.string,
  notRequired: PropTypes.bool,
  fmu: PropTypes.object,
  user: PropTypes.object,
  onChange: PropTypes.func,
  intl: intlShape.isRequired
};


export default injectIntl(connect(
  null,
  { getOperator }
)(DocModal));
