import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';

// Intl
import { injectIntl, intlShape } from 'react-intl';

// Redux
import { connect } from 'react-redux';
import { saveOperator } from 'modules/user';
import { toastr } from 'react-redux-toastr';

// Next components
import Link from 'next/link';

// Components
import Spinner from 'components/ui/spinner';
import Field from 'components/form/Field';
import Input from 'components/form/Input';
import Textarea from 'components/form/Textarea';
import FileImage from 'components/form/FileImage';
import CheckboxGroup from 'components/form/CheckboxGroup';
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

class NewOperator extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      form: {
        name: '',
        details: '',
        type: '',
        address: '',
        website: '',
        country: '',
        fmus: []
      },
      certifications: {},
      countryOptions: [],
      countryLoading: true,
      fmusOptions: [],
      fmusLoading: true,
      submitting: false,
      submitted: false
    };

    // Bindings
    this.onChange = this.onChange.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
  }

  componentDidMount() {
    this.getCountries();
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

  onChangeCertifications(value) {
    const certifications = Object.assign({}, this.state.certifications, value);
    this.setState({ certifications });
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
        this.props.saveOperator({ body: HELPERS_REGISTER.getBody(this.state.form) })
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

  /**
   * HELPERS
   * - getCountries
   * - getFmus
   *
  */
  async getCountries() {
    const { language } = this.props;
    this.setState({ countryLoading: true });
    const countries = await HELPERS_REGISTER.getCountries(language);

    this.setState({
      countryOptions: countries.options,
      countryLoading: false
    });
  }

  async getFmus(countryId) {
    this.setState({ fmusLoading: true });
    const fmus = await HELPERS_REGISTER.getOperatorFmus(countryId);
    this.setState({
      fmusOptions: fmus,
      fmusLoading: false
    });
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
              <h2 className="c-title -huge">
                {this.props.intl.formatMessage({ id: 'info.operator' })}
              </h2>

              {/* Operator name */}
              <Field
                ref={(c) => { if (c) FORM_ELEMENTS.elements.name = c; }}
                onChange={value => this.onChange({ name: value })}
                validations={['required']}
                className="-fluid"
                properties={{
                  name: 'name',
                  label: this.props.intl.formatMessage({ id: 'signup.operators.form.field.name' }),
                  required: true,
                  default: this.state.form.name
                }}
              >
                {Input}
              </Field>

              {/* Operator description */}
              <Field
                ref={(c) => { if (c) FORM_ELEMENTS.elements.details = c; }}
                onChange={value => this.onChange({ details: value })}
                className="-fluid"
                properties={{
                  name: 'details',
                  label: this.props.intl.formatMessage({ id: 'signup.operators.form.field.details' }),
                  default: this.state.form.details,
                  rows: '6'
                }}
              >
                {Textarea}
              </Field>

              {/* Operator type */}
              <Field
                ref={(c) => { if (c) FORM_ELEMENTS.elements.operator_type = c; }}
                onChange={value => this.onChange({ operator_type: value })}
                validations={['required']}
                className="-fluid"
                options={HELPERS_REGISTER.getOperatorTypes().map(t => ({
                  ...t,
                  label: this.props.intl.formatMessage({ id: t.label })
                }))}
                properties={{
                  name: 'operator_type',
                  label: this.props.intl.formatMessage({ id: 'signup.operators.form.field.operator_type' }),
                  required: true,
                  instanceId: 'select.operator_type',
                  default: this.state.form.operator_type,
                  placeholder: ''
                }}
              >
                {Select}
              </Field>

              {/* Website */}
              <Field
                ref={(c) => { if (c) FORM_ELEMENTS.elements.website = c; }}
                onChange={value => this.onChange({ website: value })}
                validations={['url']}
                className="-fluid"
                properties={{
                  name: 'website',
                  label: this.props.intl.formatMessage({ id: 'signup.operators.form.field.website' }),
                  default: this.state.form.website
                }}
              >
                {Input}
              </Field>

              {/* Address */}
              <Field
                ref={(c) => { if (c) FORM_ELEMENTS.elements.address = c; }}
                onChange={value => this.onChange({ address: value })}
                className="-fluid"
                properties={{
                  name: 'address',
                  label: this.props.intl.formatMessage({ id: 'signup.operators.form.field.address' }),
                  default: this.state.form.address
                }}
              >
                {Input}
              </Field>

              {/* Logo */}
              <Field
                ref={(c) => { if (c) FORM_ELEMENTS.elements.logo = c; }}
                onChange={value => this.onChange({ logo: value })}
                className="-fluid"
                properties={{
                  name: 'logo',
                  label: this.props.intl.formatMessage({ id: 'signup.operators.form.field.logo' }),
                  default: this.state.form.logo
                }}
              >
                {FileImage}
              </Field>

            </fieldset>

            <fieldset className="c-field-container">
              <h2 className="c-title -huge">
                {this.props.intl.formatMessage({ id: 'forest-management-units' })}
              </h2>

              <div className="c-field-row">
                {/* Country */}
                <Field
                  ref={(c) => { if (c) FORM_ELEMENTS.elements.country = c; }}
                  onChange={(value) => {
                    this.onChange({
                      country: value,
                      fmus: []
                    });
                    this.getFmus(value);
                  }}
                  validations={['required']}
                  className="-fluid"
                  options={this.state.countryOptions}
                  properties={{
                    name: 'country',
                    label: this.props.intl.formatMessage({ id: 'signup.operators.form.field.country' }),
                    required: true,
                    instanceId: 'select.country',
                    default: this.state.form.country,
                    placeholder: ''
                  }}
                >
                  {Select}
                </Field>

                {!!this.state.form.country &&
                  <Spinner isLoading={this.state.fmusLoading} />
                }

                {/* FMUs */}
                {!!this.state.fmusOptions.length &&
                  <Field
                    ref={(c) => { if (c) FORM_ELEMENTS.elements.fmus = c; }}
                    onChange={value => this.onChange({ fmus: value })}
                    className="-fluid"
                    grid={{
                      small: 12,
                      medium: 4,
                      large: 4
                    }}
                    options={this.state.fmusOptions}
                    properties={{
                      name: 'fmus',
                      label: 'FMUs',
                      default: this.state.form.fmus
                    }}
                  >
                    {CheckboxGroup}
                  </Field>
                }
              </div>
            </fieldset>

            <ul className="c-field-buttons">
              <li>
                <button
                  type="submit"
                  name="commit"
                  disabled={submitting}
                  className={`c-button -secondary -expanded ${submittingClassName}`}
                >
                  {this.props.intl.formatMessage({ id: 'create.operator' })}
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

NewOperator.propTypes = {
  saveOperator: PropTypes.func,
  onSubmit: PropTypes.func,
  intl: intlShape.isRequired
};


export default injectIntl(connect(
  state => ({
    language: state.language
  }),
  { saveOperator }
)(NewOperator));
