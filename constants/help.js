const TABS_HELP = [{
  label: 'Overview',
  value: 'overview'
}, {
  label: 'How OTP works',
  value: 'how-otp-works'
}, {
  label: 'Legislation and Regulations',
  value: 'legislation-and-regulations'
}, {
  label: 'FAQs',
  value: 'faqs'
}];


const HOW_OTP_WORKS_HELP = [{
  id: 'sources-of-information',
  title: 'help.tabs.howto.post1.title',
  description: 'help.tabs.howto.post1.description',
  link: {
    label: 'Read more',
    href: '/help?tab=how-otp-works&article=sources-of-information',
    as: '/help/how-otp-works?article=sources-of-information'
  }
}, {
  id: 'score-calculation',
  title: 'help.tabs.howto.post2.title',
  description: 'help.tabs.howto.post2.description',
  link: {
    label: 'Read more',
    href: '/help?tab=how-otp-works&article=score-calculation',
    as: '/help/how-otp-works?article=score-calculation'
  }
}, {
  id: 'geographical-scope',
  title: 'help.tabs.howto.post3.title',
  description: 'help.tabs.howto.post3.description',
  link: {
    label: 'Read more',
    href: '/help?tab=how-otp-works&article=geographical-scope',
    as: '/help/how-otp-works?article=geographical-scope'
  }
}, {
  id: 'assessing-severity-of-observations',
  title: 'help.tabs.howto.post4.title',
  description: 'help.tabs.howto.post4.description',
  link: {
    label: 'Read more',
    href: '/help?tab=how-otp-works&article=assessing-severity-of-observations',
    as: '/help/how-otp-works?article=assessing-severity-of-observations'
  }
}];


const LEGISLATION_AND_REGULATIONS_HELP = [{
  id: 'forest-products-and-legality',
  title: 'help.tabs.legislation.post1.title',
  description: 'help.tabs.legislation.post1.description',
  site: 'http://www.forestlegality.org/risk-tool',
  link: {
    label: 'Read more',
    href: '/help?tab=legislation-and-regulations&article=forest-products-and-legality',
    as: '/help/legislation-and-regulations?article=forest-products-and-legality'
  }
}, {
  id: 'timber-trade-and-due-diligence',
  title: 'help.tabs.legislation.post2.title',
  description: 'help.tabs.legislation.post2.description',
  site: 'http://www.euflegt.efi.int/home/',
  link: {
    label: 'Read more',
    href: '/help?tab=legislation-and-regulations&article=timber-trade-and-due-diligence',
    as: '/help/legislation-and-regulations?article=timber-trade-and-due-diligence'
  }
}, {
  id: 'voluntary-partnership-agreement-vpa-process',
  title: 'help.tabs.legislation.post3.title',
  description: 'help.tabs.legislation.post3.description',
  site: 'http://www.timbertradeportal.com/',
  link: {
    label: 'Read more',
    href: '/help?tab=legislation-and-regulations&article=voluntary-partnership-agreement-vpa-process',
    as: '/help/legislation-and-regulations?article=voluntary-partnership-agreement-vpa-process'
  }
}];

const FAQS_HELP = [{
  id: 'first-faq',
  title: 'help.tabs.faqs.post1.title',
  description: 'help.tabs.faqs.post1.description',
  link: {
    label: 'Read more',
    href: '/help?tab=faqs&article=first-faq',
    as: '/help/faqs?article=first-faq'
  }
}, {
  id: 'second-faq',
  title: 'help.tabs.faqs.post2.title',
  description: 'help.tabs.faqs.post2.description',
  link: {
    label: 'Read more',
    href: '/help?tab=faqs&article=second-faq',
    as: '/help/faqs?article=second-faq'
  }
}, {
  id: 'third-faq',
  title: 'help.tabs.faqs.post3.title',
  description: 'help.tabs.faqs.post3.description',
  link: {
    label: 'Read more',
    href: '/help?tab=faqs&article=third-faq',
    as: '/help/faqs?article=third-faq'
  }
}];
export { TABS_HELP, HOW_OTP_WORKS_HELP, LEGISLATION_AND_REGULATIONS_HELP, FAQS_HELP };
