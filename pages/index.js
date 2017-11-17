import React from 'react';

// Redux
import withRedux from 'next-redux-wrapper';
import { store } from 'store';

// Intl
import withIntl from 'hoc/with-intl';
import { intlShape } from 'react-intl';

// Toastr
import { toastr } from 'react-redux-toastr';

// Components
import Page from 'components/layout/page';
import Layout from 'components/layout/layout';
import StaticSection from 'components/ui/static-section';
import Card from 'components/ui/card';
import Field from 'components/form/field';
import Input from 'components/form/input';


// Constants
export const FORM_ELEMENTS = {
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
      .map(k => elements[k].isValid())
      .filter(v => v !== null)
      .every(element => element);

    return valid;
  }
};

class HomePage extends Page {

  constructor(props) {
    super(props);

    this.state = {
      form: {
        email: null
      }
    };

    // BINDINGS
    this.onSubmit = this.onSubmit.bind(this);
    this.setStateForm = this.setStateForm.bind(this);
  }

  onSubmit(e) {
    e && e.preventDefault();

    let status;
    // Validate the form
    FORM_ELEMENTS.validate();

    // Set a timeout due to the setState function of react
    setTimeout(() => {
      const valid = FORM_ELEMENTS.isValid();
      if (valid) {
        // Start the submitting
        this.setState({ submitting: true });

        fetch(`${process.env.OTP_API}/contacts`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'OTP-API-KEY': process.env.OTP_API_KEY
          },
          body: JSON.stringify(this.state.form)
        })
          .then((response) => {
            status = response.ok;
            return response.json();
          })
          .then((data) => {
            if (status) {
              toastr.success('Congratulations!!', 'You\'ve been added to our mailing list.');
            } else {
              Object.keys(data).forEach((d) => {
                toastr.error('Error', `${d}: ${data[d]}`);
              });
            }
          });
      }
    }, 0);
  }

  setStateForm(name, value) {
    const form = {
      ...this.state.form,
      [name]: value
    };

    this.setState({ form });
  }

  render() {
    const { url, session } = this.props;

    return (
      <Layout
        title="Home"
        description="Home description..."
        url={url}
        session={session}
      >
        {/* INTRO */}
        <StaticSection
          background="/static/images/home/bg-intro.jpg"
          position={{ bottom: true, left: true }}
          column={9}
        >
          <div className="c-intro">
            <h2
              dangerouslySetInnerHTML={{
                __html: this.props.intl.formatHTMLMessage({ id: 'home.intro' })
              }}
            />
            <p>Are you interested in receiving updates on the OTP development? Register for our mailing list by adding your email address here.</p>

            <form className="c-form" onSubmit={this.onSubmit} noValidate>
              <Field
                ref={(c) => { if (c) FORM_ELEMENTS.elements.email = c; }}
                validations={['required', 'email']}
                properties={{
                  name: 'email',
                  label: null,
                  placeholder: 'sample.email@wri.org',
                  type: 'email',
                  required: true,
                  default: ''
                }}
                onChange={value => this.setStateForm('email', value)}
              >
                {Input}
              </Field>

              <button className="c-button -tertiary" type="submit">Send</button>
            </form>
          </div>
        </StaticSection>

        {/* SECTION A */}
        <StaticSection
          background="/static/images/home/bg-a.jpg"
          position={{ top: true, left: true }}
          column={4}
        >
          <Card
            theme="-secondary"
            title="The launching date is September 2017"
            description="In the meantime, if you have any questions and requests about the Open Timber Portal, please contact us at <a href='mailto:opentimberportal@wri.org'>opentimberportal@wri.org</a>"
          />
        </StaticSection>
      </Layout>
    );
  }
}

HomePage.propTypes = {
  intl: intlShape.isRequired
};

export default withIntl(withRedux(
  store
)(HomePage));
