import React from 'react';
import classnames from 'classnames';

// Intl
import { injectIntl } from 'react-intl';

// Redux
import { connect } from 'react-redux';
import { saveNewsLetter } from 'modules/user';
import { toastr } from 'react-redux-toastr';

// Next components
import Link from 'next/link';

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

class UserNewForm extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      form: {
        email: ''
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

        // Save newsletter
        this.props.saveNewsLetter({ body: this.state.form })
          .then(() => {
            this.setState({ submitting: false, submitted: true });
            if (this.props.onSubmit) this.props.onSubmit();
          })
          .catch((errors) => {
            this.setState({ submitting: false });
            console.error(errors);

            try {
              errors.forEach(er =>
                toastr.error(this.props.intl.formatMessage({ id: 'Error' }), `${er.title} - ${er.detail}`)
              );
            } catch (e) {
              toastr.error(this.props.intl.formatMessage({ id: 'Error' }), this.props.intl.formatMessage({ id: 'Oops! There was an error, try again' }));
            }
          });
      } else {
        toastr.error(this.props.intl.formatMessage({ id: 'Error' }), this.props.intl.formatMessage({ id: 'Fill all the required fields' }));
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
              {/* Name */}
              <Field
                ref={(c) => { if (c) FORM_ELEMENTS.elements.email = c; }}
                onChange={value => this.onChange({ email: value })}
                validations={['required', 'email']}
                className="-fluid"
                properties={{
                  name: 'email',
                  label: this.props.intl.formatMessage({ id: 'signup.user.form.field.email' }),
                  required: true,
                  default: this.state.form.email
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

export default injectIntl(connect(
  null,
  { saveNewsLetter }
)(UserNewForm));
