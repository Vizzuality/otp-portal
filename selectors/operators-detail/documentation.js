import { createSelector } from 'reselect';
import sortBy from 'lodash/sortBy';
import compact from 'lodash/compact';

// Get the datasets and filters from state
const operatorsDetail = state => state.operatorsDetail;

// Create a function to compare the current active datatasets and the current datasetsIds
const getParsedDocumentation = createSelector(
  operatorsDetail,
  (_operatorsDetail) => {
    let countryDocumentation = [];
    let fmuDocumentation = [];

    if (_operatorsDetail.data['operator-document-countries']) {
      countryDocumentation = _operatorsDetail.data['operator-document-countries'].map((doc) => {
        if (doc['required-operator-document-country']) {
          if (doc['required-operator-document-country']['contract-signature']) {
            return null;
          }

          return {
            id: doc.id,
            requiredDocId: doc['required-operator-document-country'].id,
            url: doc.attachment.url,
            type: doc.type,
            title: doc['required-operator-document-country'].name,
            public: doc.public,
            explanation: doc['required-operator-document-country'].explanation,
            category: doc['required-operator-document-country']['required-operator-document-group'].name,
            categoryPosition: doc['required-operator-document-country']['required-operator-document-group'].position,
            status: doc.status,
            reason: doc.reason,
            startDate: new Date(doc['start-date']).toJSON().slice(0, 10).replace(/-/g, '/'),
            endDate: new Date(doc['expire-date']).toJSON().slice(0, 10).replace(/-/g, '/'),
            annexes: doc['operator-document-annexes'] ? doc['operator-document-annexes'] : []
          };
        }
        return null;
      });
    }

    if (_operatorsDetail.data['operator-document-fmus']) {
      fmuDocumentation = _operatorsDetail.data['operator-document-fmus'].map((doc) => {
        if (doc['required-operator-document-fmu']) {
          return {
            id: doc.id,
            requiredDocId: doc['required-operator-document-fmu'].id,
            url: doc.attachment.url,
            type: doc.type,
            title: doc['required-operator-document-fmu'].name,
            public: doc.public,
            explanation: doc['required-operator-document-fmu'].explanation,
            category: doc['required-operator-document-fmu']['required-operator-document-group'].name,
            categoryPosition: doc['required-operator-document-fmu']['required-operator-document-group'].position,
            status: doc.status,
            reason: doc.reason,
            fmu: doc.fmu,
            startDate: new Date(doc['start-date']).toJSON().slice(0, 10).replace(/-/g, '/'),
            endDate: new Date(doc['expire-date']).toJSON().slice(0, 10).replace(/-/g, '/'),
            annexes: doc['operator-document-annexes'] ? doc['operator-document-annexes'] : []
          };
        }
        return null;
      });

      return [...compact(fmuDocumentation), ...compact(countryDocumentation)];
    }

    return [];
  }
);


// Create a function to compare the current active datatasets and the current datasetsIds
const getAllParsedDocumentation = createSelector(
  operatorsDetail,
  (_operatorsDetail) => {
    const documentation = _operatorsDetail.documentation.data;

    if (documentation && !!documentation.length) {
      return compact(sortBy(documentation.filter(d => d.status !== 'doc_not_provided').map((doc) => {
        if (doc['required-operator-document']) {
          return {
            id: doc.id,
            requiredDocId: doc['required-operator-document'].id,
            type: doc.type,
            title: doc['required-operator-document'].name,
            category: doc['required-operator-document']['required-operator-document-group'].name,
            categoryPosition: doc['required-operator-document']['required-operator-document-group'].position,
            status: doc.status,
            startDate: new Date(doc['start-date']),
            endDate: new Date(doc['expire-date'])
          };
        }

        return null;
      }), 'title'));
    }

    return [];
  }
);


const getContractSignatureDocumentation = createSelector(
  operatorsDetail,
  (_operatorsDetail) => {
    let contractSignature = {};

    if (_operatorsDetail.data['operator-document-countries']) {
      const doc = _operatorsDetail.data['operator-document-countries'].find((d) => {
        const required = d['required-operator-document-country'];

        if (!required) return false;

        return required['contract-signature'];
      });

      if (doc) {
        contractSignature = {
          id: doc.id,
          requiredDocId: doc['required-operator-document-country'].id,
          url: doc.attachment.url,
          type: doc.type,
          public: doc.public,
          title: doc['required-operator-document-country'].name,
          explanation: doc['required-operator-document-country'].explanation,
          category: doc['required-operator-document-country']['required-operator-document-group'].name,
          categoryPosition: doc['required-operator-document-country']['required-operator-document-group'].position,
          status: doc.status,
          reason: doc.reason,
          startDate: new Date(doc['start-date']).toJSON().slice(0, 10).replace(/-/g, '/'),
          endDate: new Date(doc['expire-date']).toJSON().slice(0, 10).replace(/-/g, '/'),
          annexes: doc['operator-document-annexes'] ? doc['operator-document-annexes'] : []
        };
      }
    }

    return contractSignature;
  }
);

export { getParsedDocumentation, getAllParsedDocumentation, getContractSignatureDocumentation };
