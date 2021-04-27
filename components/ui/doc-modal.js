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
import Select from 'components/form/SelectInput';
import Textarea from 'components/form/Textarea';
import File from 'components/form/File';
import Spinner from 'components/ui/spinner';

// Constants
const FORM_ELEMENTS = {
  elements: {},
  validate() {
    const elements = this.elements;
    Object.keys(elements).forEach((k) => {
      elements[k].validate();
    });
  },
  isValid() {
    const elements = this.elements;
    const valid = Object.keys(elements)
      .map((k) => elements[k].isValid())
      .filter((v) => v !== null)
      .every((element) => element);

    return valid;
  },
};

const TYPES = {
  'operator-document-country-histories': 'operator-document-countries',
  'operator-document-fmu-histories': 'operator-document-fmus',
};

class DocModal extends React.Component {
  constructor(props) {
    super(props);
    const { startDate, endDate, url, reason, source, sourceInfo } = props;

    this.state = {
      form: {
        startDate:
          startDate &&
          startDate !== '1970/01/01' &&
          startDate.replace(/\//g, '-'),
        expireDate:
          endDate && endDate !== '1970/01/01' && endDate.replace(/\//g, '-'),
        file: '',
        url,
        reason,
        source: source || 'company',
        sourceInfo,
      },
      showFile: false,
      submitting: false,
      errors: [],
    };

    // Bindings
    this.onChange = this.onChange.bind(this);
    this.onSubmit = this.onSubmit.bind(this);

    // Services
    this.documentationService = new DocumentationService({
      authorization: props.user.token,
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

    const { type, docId } = this.props;

    // Validate the form
    FORM_ELEMENTS.validate();

    // Set a timeout due to the setState function of react
    setTimeout(() => {
      // Validate all the inputs on the current step
      const valid = FORM_ELEMENTS.isValid(this.state.form);

      if (valid) {
        // Start the submitting
        this.setState({ submitting: true });

        this.documentationService
          .saveDocument({
            url: `${TYPES[type]}/${docId}`,
            type: 'PATCH',
            body: this.getBody('patch'),
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
      }
    }, 0);
  }

  /**
   * HELPERS
   * - getBody
   */
  getBody(request) {
    const { type, docId, requiredDocId, properties, fmu } = this.props;
    const { id: propertyId, type: typeDoc } = properties;

    const TYPES = {
      'operator-document-country-histories': 'operator-document-countries',
      'operator-document-fmu-histories': 'operator-document-fmus',
    };

    return {
      data: {
        id: docId,
        type: TYPES[type],
        attributes: {
          'start-date': this.state.form.startDate,
          'expire-date': this.state.form.expireDate,
          'source-type': this.state.form.source,
          'source-info':
            this.state.form.source === 'other_source'
              ? this.state.form.sourceInfo
              : null,
          ...(this.state.form.file && {
            attachment: this.state.form.file,
          }),
          ...(this.state.form.reason && {
            reason: this.state.form.reason,
          }),
          ...(fmu && request === 'post' && { 'fmu-id': fmu.id }),
          ...(typeDoc === 'operator' && {
            'operator-id': propertyId,
            'required-operator-document-id': requiredDocId,
          }),
          ...(typeDoc === 'government' && {
            'country-id': propertyId,
            'required-gov-document-id': requiredDocId,
          }),
        },
      },
    };
  }

  render() {
    const { submitting, errors } = this.state;
    const { title, url, notRequired } = this.props;

    const submittingClassName = classnames({
      '-submitting': submitting,
    });

    return (
      <div className="c-login">
        <Spinner isLoading={submitting} className="-light" />

        <h2 className="c-title -extrabig">{title}</h2>

        <form className="c-form" onSubmit={this.onSubmit} noValidate>
          <fieldset className="c-field-container">
            <div className="l-row row">
              <div className="columns medium-6 small-12">
                {/* DATE */}
                <Field
                  ref={(c) => {
                    if (c) FORM_ELEMENTS.elements.startDate = c;
                  }}
                  onChange={(value) => this.onChange({ startDate: value })}
                  validations={['required']}
                  className="-fluid"
                  properties={{
                    name: 'startDate',
                    label: notRequired
                      ? this.props.intl.formatMessage({ id: 'start_date' })
                      : this.props.intl.formatMessage({ id: 'doc.start_date' }),
                    type: 'date',
                    required: true,
                    default: this.state.form.startDate,
                  }}
                >
                  {Input}
                </Field>
              </div>
              <div className="columns medium-6 small-12">
                {/* DATE */}
                <Field
                  ref={(c) => {
                    if (c) FORM_ELEMENTS.elements.expireDate = c;
                  }}
                  onChange={(value) => this.onChange({ expireDate: value })}
                  className="-fluid"
                  properties={{
                    name: 'expireDate',
                    label: notRequired
                      ? this.props.intl.formatMessage({ id: 'expire_date' })
                      : this.props.intl.formatMessage({
                          id: 'doc.expiry_date',
                        }),
                    type: 'date',
                    default: this.state.form.expireDate,
                  }}
                >
                  {Input}
                </Field>
              </div>
            </div>

            {!notRequired && (
              <div className="l-row row">
                <div className="columns small-12">
                  <Field
                    ref={(c) => {
                      if (c) FORM_ELEMENTS.elements.source = c;
                    }}
                    onChange={(value) => this.onChange({ source: value })}
                    validations={['required']}
                    className="-fluid"
                    options={[
                      {
                        label: this.props.intl.formatMessage({ id: 'company' }),
                        value: 'company',
                      },
                      {
                        label: this.props.intl.formatMessage({
                          id: 'forest_atlas',
                        }),
                        value: 'forest_atlas',
                      },
                      {
                        label: this.props.intl.formatMessage({
                          id: 'other_source',
                        }),
                        value: 'other_source',
                      },
                    ]}
                    properties={{
                      name: 'source',
                      label: this.props.intl.formatMessage({ id: 'source' }),
                      required: true,
                      default: this.state.form.source,
                    }}
                  >
                    {Select}
                  </Field>
                </div>
                {this.state.form.source === 'other_source' && (
                  <div className="columns small-12">
                    <Field
                      ref={(c) => {
                        if (c) FORM_ELEMENTS.elements.sourceInfo = c;
                      }}
                      onChange={(value) => this.onChange({ sourceInfo: value })}
                      validations={['required']}
                      className="-fluid"
                      properties={{
                        name: 'source-info',
                        label: this.props.intl.formatMessage({
                          id: 'source-info',
                        }),
                        required: true,
                        default: this.state.form.sourceInfo,
                      }}
                    >
                      {Input}
                    </Field>
                  </div>
                )}
              </div>
            )}

            {/* DOCUMENT */}
            {(!notRequired ||
              (this.state.form.file && !this.state.form.reason)) && (
              <div className="l-row row">
                <div className="columns small-12">
                  <Field
                    ref={(c) => {
                      if (c) FORM_ELEMENTS.elements.file = c;
                    }}
                    onChange={(value) => this.onChange({ file: value })}
                    validations={!url ? ['required'] : []}
                    className="-fluid"
                    properties={{
                      name: 'file',
                      label: this.props.intl.formatMessage({ id: 'file' }),
                      required: !url,
                      defaultFile: url,
                    }}
                  >
                    {File}
                  </Field>
                </div>
              </div>
            )}

            {/* REASON */}
            {(notRequired ||
              (this.state.form.reason && !this.state.form.file)) && (
              <div className="l-row row">
                <div className="columns small-12">
                  <Field
                    ref={(c) => {
                      if (c) FORM_ELEMENTS.elements.reason = c;
                    }}
                    onChange={(value) => this.onChange({ reason: value })}
                    className="-fluid"
                    validations={['required']}
                    properties={{
                      name: 'reason',
                      label: this.props.intl.formatMessage({
                        id: 'why-is-it-not-required',
                      }),
                      required: true,
                      rows: '6',
                      default: this.state.form.reason,
                    }}
                  >
                    {Textarea}
                  </Field>
                </div>
              </div>
            )}
          </fieldset>

          {!!errors.length && Array.isArray(errors) && <div>Error</div>}

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
                  id: 'submit',
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
  id: PropTypes.string,
  docId: PropTypes.number,
  startDate: PropTypes.string,
  endDate: PropTypes.string,
  status: PropTypes.string,
  url: PropTypes.string,
  reason: PropTypes.string,
  source: PropTypes.string,
  sourceInfo: PropTypes.string,
  title: PropTypes.string,
  requiredDocId: PropTypes.string,
  type: PropTypes.string,
  properties: PropTypes.object,
  notRequired: PropTypes.bool,
  fmu: PropTypes.object,
  user: PropTypes.object,
  onChange: PropTypes.func,
  intl: intlShape.isRequired,
};

export default injectIntl(connect(null, { getOperator })(DocModal));
