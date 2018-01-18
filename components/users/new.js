import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';

// Intl
import { injectIntl, intlShape } from 'react-intl';

// Redux
import { connect } from 'react-redux';
import { saveUser } from 'modules/user';
import { toastr } from 'react-redux-toastr';

// Next components
import Link from 'next/link';

// Components
import Spinner from 'components/ui/spinner';
import Field from 'components/form/Field';
import Input from 'components/form/Input';
import Select from 'components/form/SelectInput';

// Utils
import { HELPERS_REGISTER } from 'utils/signup';

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

class UserNewForm extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      form: {
        name: '',
        nickname: '',
        email: '',
        operator_id: '',
        password: '',
        password_confirmation: '',
        permissions_request: 'operator'
      },
      submitting: false,
      submitted: false
    };

    // Bindings
    this.onChange = this.onChange.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
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
    FORM_ELEMENTS.validate(this.state.form);

    // Set a timeout due to the setState function of react
    setTimeout(() => {
      // Validate all the inputs on the current step
      const valid = FORM_ELEMENTS.isValid(this.state.form);

      if (valid) {
        // Start the submitting
        this.setState({ submitting: true });

        // Save data
        this.props.saveUser({ body: HELPERS_REGISTER.getUserBody(this.state.form) })
          .then(() => {
            this.setState({ submitting: false, submitted: true });
            if (this.props.onSubmit) this.props.onSubmit();
          })
          .catch((errors) => {
            this.setState({ submitting: false });
            console.error(errors);

            try {
              errors.forEach(er =>
                toastr.error('Error', `${er.title} - ${er.detail}`)
              );
            } catch (e) {
              toastr.error('Error', 'Oops! There was an error, try again');
            }
          });
      } else {
        toastr.error('Error', 'Fill all the required fields');
      }
    }, 0);
  }

  render() {
    const { submitting, submitted } = this.state;
    const submittingClassName = classnames({
      '-submitting': submitting
    });

    return (
      <div className="c-section">
        <Spinner isLoading={submitting} className="-light -fixed" />

        {!submitted &&
          <form className="c-form" onSubmit={this.onSubmit} noValidate>
            <fieldset className="c-field-container">
              {/* Operators */}
              <Field
                ref={(c) => { if (c) FORM_ELEMENTS.elements.operator_type = c; }}
                onChange={value => this.onChange({ operator_id: value })}
                validations={['required']}
                className="-fluid"
                hint={`${this.props.intl.formatMessage({ id: 'signin.not_a_producer' })} <a href="/operators/new">${this.props.intl.formatMessage({ id: 'signin.register_producer' })}</a>`}
                options={HELPERS_REGISTER.getOperators(this.props.operators.data)}
                properties={{
                  name: 'operator_id',
                  label: 'Producer',
                  required: true,
                  instanceId: 'select.operator_id',
                  default: this.state.form.operator_id
                }}
              >
                {Select}
              </Field>

              {/* Name */}
              <Field
                ref={(c) => { if (c) FORM_ELEMENTS.elements.name = c; }}
                onChange={value => this.onChange({ name: value })}
                validations={['required']}
                className="-fluid"
                properties={{
                  name: 'name',
                  label: 'Name',
                  required: true,
                  default: this.state.form.name
                }}
              >
                {Input}
              </Field>

              {/* Name */}
              <Field
                ref={(c) => { if (c) FORM_ELEMENTS.elements.nickname = c; }}
                onChange={value => this.onChange({ nickname: value })}
                validations={['required']}
                className="-fluid"
                properties={{
                  name: 'nickname',
                  label: 'Nickname',
                  required: true,
                  default: this.state.form.nickname
                }}
              >
                {Input}
              </Field>

              {/* Name */}
              <Field
                ref={(c) => { if (c) FORM_ELEMENTS.elements.email = c; }}
                onChange={value => this.onChange({ email: value })}
                validations={['required', 'email']}
                className="-fluid"
                properties={{
                  name: 'email',
                  label: 'Email',
                  required: true,
                  default: this.state.form.email
                }}
              >
                {Input}
              </Field>

              {/* Name */}
              <Field
                ref={(c) => { if (c) FORM_ELEMENTS.elements.password = c; }}
                onChange={value => this.onChange({ password: value })}
                validations={['required']}
                className="-fluid"
                properties={{
                  name: 'password',
                  label: 'Password',
                  type: 'password',
                  required: true,
                  default: this.state.form.password
                }}
              >
                {Input}
              </Field>

              {/* Name */}
              <Field
                ref={(c) => { if (c) FORM_ELEMENTS.elements.password_confirmation = c; }}
                onChange={value => this.onChange({ password_confirmation: value })}
                validations={[
                  'required',
                  {
                    type: 'isEqual',
                    condition: this.state.form.password
                  }
                ]}
                className="-fluid"
                properties={{
                  name: 'password_confirmation',
                  label: 'Password confirmation',
                  type: 'password',
                  required: true,
                  default: this.state.form.password_confirmation
                }}
              >
                {Input}
              </Field>
            </fieldset>

            <ul className="c-field-buttons">
              <li>
                <button
                  type="submit"
                  name="commit"
                  disabled={submitting}
                  className={`c-button -secondary -expanded ${submittingClassName}`}
                >
                  {this.props.intl.formatMessage({ id: 'signup' })}
                </button>
              </li>
            </ul>
          </form>
        }

        {submitted &&
          <div className="c-form">
            <h2 className="c-title -huge">
              {this.props.intl.formatMessage({ id: 'thankyou' })}
            </h2>

            <p>
              {this.props.intl.formatMessage({ id: 'wait-for-approval' })}
            </p>

            <ul className="c-field-buttons">
              <li>
                <Link href="/operators">
                  <a className="card-link c-button -primary -fullwidth">
                    {this.props.intl.formatMessage({ id: 'operators' })}
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/observations">
                  <a className="card-link c-button -primary -fullwidth">
                    {this.props.intl.formatMessage({ id: 'observations' })}
                  </a>
                </Link>
              </li>
            </ul>
          </div>
        }
      </div>
    );
  }
}

UserNewForm.propTypes = {
  operators: PropTypes.object,
  saveUser: PropTypes.func,
  onSubmit: PropTypes.func,
  intl: intlShape.isRequired
};


export default injectIntl(connect(
  state => ({
    operators: state.operators
  }),
  { saveUser }
)(UserNewForm));
