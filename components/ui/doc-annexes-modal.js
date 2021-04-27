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
import Spinner from 'components/ui/spinner';
import File from 'components/form/File';

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

class DocAnnexesModal extends React.Component {
  static propTypes = {
    title: PropTypes.string,
    intl: intlShape.isRequired,
    user: PropTypes.object,
    docId: PropTypes.string,
    onChange: PropTypes.func
  };

  constructor(props) {
    super(props);
    this.documentationService = new DocumentationService({
      authorization: props.user.token
    });
  }

  state = {
    form: {
      name: '',
      startDate: '',
      expiryDate: '',
      file: ''
    },
    submitting: false,
    errors: []
  }

  getBody() {
    const { docId } = this.props;

    return {
      data: {
        type: 'operator-document-annexes', // TODO: Confirm if server side can accommodate -countries / -fmu
        attributes: {
          name: this.state.form.name,
          'start-date': this.state.form.startDate,
          'expire-date': this.state.form.expireDate,
          attachment: this.state.form.file
        },
        relationships: {
          "operator-document": {
            data: {
              type: "operator-documents",
              id: docId
            }
          }
        }
      }
    };
  }

  handleChange(value) {
    const form = Object.assign({}, this.state.form, value);
    this.setState({ form });
  }

  handleSubmit(e) {
    e.preventDefault();

    // Validate the form
    FORM_ELEMENTS.validate();


    // Set a timeout due to the setState function of react
    setTimeout(() => {
      // Validate all the inputs on the current step
      const valid = FORM_ELEMENTS.isValid(this.state.form);

      if (valid) {
        // Start the submitting
        this.setState({ submitting: true });

        this.documentationService.saveAnnex({
          url: 'operator-document-annexes',
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

  render() {
    const { submitting } = this.state;
    const { title } = this.props;
    const submittingClassName = classnames({
      '-submitting': submitting
    });

    return (
      <div className="c-login">
        <Spinner isLoading={submitting} className="-light" />
        <h2 className="c-title -extrabig">Add a document for the annex of {title}</h2>
        <form className="c-form" onSubmit={e => this.handleSubmit(e)} noValidate>
          <fieldset className="c-field-container">
            <div className="c-field-row">
              <Field
                ref={(c) => { if (c) FORM_ELEMENTS.elements.name = c; }}
                onChange={value => this.handleChange({ name: value })}
                className="-fluid"
                validations={['required']}
                properties={{
                  name: 'name',
                  label: this.props.intl.formatMessage({ id: 'annex.form.name' }),
                  required: true,
                  type: 'text',
                  default: this.state.form.name
                }}
              >
                {Input}
              </Field>
            </div>
            <div className="c-field-row">
              <div className="l-row row">
                <div className="columns medium-6 small-12">
                  {/* DATE */}
                  <Field
                    ref={(c) => { if (c) FORM_ELEMENTS.elements.startDate = c; }}
                    onChange={value => this.handleChange({ startDate: value })}
                    validations={['required']}
                    className="-fluid"
                    properties={{
                      name: 'startDate',
                      label: this.props.intl.formatMessage({ id: 'annex.form.start_date' }),
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
                    onChange={value => this.handleChange({ expireDate: value })}
                    className="-fluid"
                    properties={{
                      name: 'expireDate',
                      label: this.props.intl.formatMessage({ id: 'annex.form.expiry_date' }),
                      type: 'date',
                      default: this.state.form.expireDate
                    }}
                  >
                    {Input}
                  </Field>
                </div>
              </div>
            </div>
            <div>
              <div className="l-row row">
                <div className="columns small-12">
                  <div className="c-field-row">
                    <Field
                      ref={(c) => { if (c) FORM_ELEMENTS.elements.file = c; }}
                      onChange={value => this.handleChange({ file: value })}
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
              </div>
            </div>
          </fieldset>
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
                {this.props.intl.formatMessage({ id: 'submit' })}
              </button>
            </li>
          </ul>
        </form>
      </div>
    );
  }
}

export default injectIntl(connect(
  state => ({
    user: state.user
  }),
  { getOperator }
)(DocAnnexesModal));
