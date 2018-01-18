import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';

// Redux
import { connect } from 'react-redux';

// Intl
import { intlShape, injectIntl } from 'react-intl';

import { login } from 'modules/user';
import { toastr } from 'react-redux-toastr';

// Services
import modal from 'services/modal';

// Components
import Spinner from 'components/ui/spinner';
import Field from 'components/form/Field';
import Input from 'components/form/Input';

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

class Login extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      form: {
        email: '',
        password: ''
      },
      submitting: false
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
        this.props.login({ body: { auth: this.state.form } })
          .then(() => {
            this.setState({ submitting: false });
            modal.toggleModal(false);
            // toastr.success('Success', `Logged`);
          })
          .catch((errors) => {
            this.setState({ submitting: false });
            console.error(errors);
            try {
              errors.forEach(er =>
                toastr.error('Error', `${er.title}`)
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
    const { submitting } = this.state;
    const submittingClassName = classnames({
      '-submitting': submitting
    });

    return (
      <div className="c-login">

        <Spinner isLoading={submitting} className="-light" />

        <h2 className="c-title -huge">
          {this.props.intl.formatMessage({ id: 'login' })}
        </h2>

        <form className="c-form" onSubmit={this.onSubmit} noValidate>
          <fieldset className="c-field-container">
            {/* EMAIL */}
            <Field
              ref={(c) => { if (c) FORM_ELEMENTS.elements.email = c; }}
              onChange={value => this.onChange({ email: value })}
              validations={['required', 'email']}
              className="-fluid"
              properties={{
                name: 'email',
                label: 'Email',
                type: 'email',
                required: true,
                default: this.state.form.email
              }}
            >
              {Input}
            </Field>

            {/* PASSWORD */}
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
          </fieldset>

          <p>{this.props.intl.formatMessage({ id: 'signin.not_a_member' })} <a href="/signup">{this.props.intl.formatMessage({ id: 'signin.register_now' })}</a></p>

          <p>{this.props.intl.formatMessage({ id: 'signin.not_a_producer' })} <a href="/operators/new">{this.props.intl.formatMessage({ id: 'signin.register_producer' })}</a></p>

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
                {this.props.intl.formatMessage({ id: 'login' })}
              </button>
            </li>
          </ul>
        </form>
      </div>
    );
  }
}

Login.propTypes = {
  intl: intlShape.isRequired,
  login: PropTypes.func.isRequired
};


export default connect(
  null,
  { login }
)(injectIntl(Login));
