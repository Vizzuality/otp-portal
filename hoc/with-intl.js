import React from 'react';
import PropTypes from 'prop-types';
import * as Cookies from 'js-cookie';

import { IntlProvider, addLocaleData, injectIntl } from 'react-intl';

import langEn from 'lang/en.json';
import langFr from 'lang/fr.json';

import en from 'react-intl/locale-data/en';
import fr from 'react-intl/locale-data/fr';

const LANGUAGES = { en, fr };
const MESSAGES = { en: langEn, fr: langFr };


// Register React Intl's locale data for the user's locale in the browser
if (typeof window !== 'undefined') {
  Object.keys(LANGUAGES).forEach((lang) => {
    addLocaleData(LANGUAGES[lang]);
  });
}

export default function withIntl(Page) {
  const IntlPage = injectIntl(Page);

  return class PageWithIntl extends React.Component {
    static propTypes = {
      language: PropTypes.string,
      now: PropTypes.number
    }

    static async getInitialProps(context) {
      let props;
      if (typeof Page.getInitialProps === 'function') {
        props = await Page.getInitialProps(context);
      }

      // Get the `locale` from the request object on the server.
      // In the browser, use the same values that the server serialized.
      const { req } = context;

      let language;

      if (req) {
        language =
          req.query.language ||
          req.cookies.language ||
          req.locale.language ||
          'en';
      } else {
        language = Cookies.get('language') || 'en';
      }

      language = (Object.keys(LANGUAGES).includes(language)) ? language : 'en';

      // Always update the current time on page load/transition because the
      // <IntlProvider> will be a new instance even with pushState routing.
      const now = Date.now();
      return { language, now, ...props };
    }

    componentDidMount() {
      // Set language cookie
      Cookies.set('language', this.props.language, { expires: 90 });
    }

    render() {
      const { now, language } = this.props;

      return (
        <IntlProvider
          locale={language}
          messages={MESSAGES[language]}
          initialNow={now}
          defaultLocale="en"
        >
          <IntlPage {...this.props} />
        </IntlProvider>
      );
    }
  };
}
