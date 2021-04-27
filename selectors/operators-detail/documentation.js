import { createSelector } from 'reselect';

// Get the datasets and filters from state
const operatorsDetail = (state) => state.operatorsDetail;
const operatorDocumentation = (state) => state.operatorsDetail.documentation;
export const getFMUs = (state) => state.operatorsDetail.data.fmus;
export const getOperatorDocumentationFMU = (state) => state.operatorsDetail.fmu;
export const getOperatorDocumentationDate = (state) =>
  state.operatorsDetail.date;

// Create a function to compare the current active datatasets and the current datasetsIds
const getParsedDocumentation = createSelector(
  [operatorDocumentation, getOperatorDocumentationFMU],
  (documentation, fmu) => {
    return documentation.data
      .filter((doc) => !doc['required-operator-document']['contract-signature'])
      .filter((doc) => !fmu || (doc.fmu && doc.fmu.id === fmu.id))
      .map((doc) => {
        try {
          return {
            id: doc.id,
            docId: doc['operator-document-id'],
            fmu: doc.fmu,
            requiredDocId: doc['required-operator-document'].id,
            url: doc.attachment?.url,
            type: doc.type,
            source: doc['source-type'],
            sourceInfo: doc['source-info'],
            title: doc['required-operator-document'].name,
            public: doc.public,
            explanation: doc['required-operator-document'].explanation,
            category:
              doc['required-operator-document'][
                'required-operator-document-group'
              ].name,
            categoryPosition:
              doc['required-operator-document'][
                'required-operator-document-group'
              ].position,
            status: doc.status,
            reason: doc.reason,
            startDate: new Date(doc['start-date'])
              .toJSON()
              .slice(0, 10)
              .replace(/-/g, '/'),
            endDate: new Date(doc['expire-date'])
              .toJSON()
              .slice(0, 10)
              .replace(/-/g, '/'),
            annexes: doc['operator-document-annexes']
              ? doc['operator-document-annexes']
              : [],
          };
        } catch (error) {
          return null;
        }
      });
  }
);

const getContractSignatureDocumentation = createSelector(
  operatorDocumentation,
  (documentation) => {
    let contractSignature = {};

    if (documentation.data) {
      const doc = documentation.data.find(
        (d) => d['required-operator-document']['contract-signature']
      );

      if (doc) {
        contractSignature = {
          id: doc.id,
          docId: doc['operator-document-id'],
          requiredDocId: doc['required-operator-document'].id,
          url: doc.attachment?.url,
          type: doc.type,
          public: doc.public,
          title: doc['required-operator-document'].name,
          explanation: doc['required-operator-document'].explanation,
          category:
            doc['required-operator-document'][
              'required-operator-document-group'
            ].name,
          categoryPosition:
            doc['required-operator-document'][
              'required-operator-document-group'
            ].position,
          status: doc.status,
          reason: doc.reason,
          startDate: new Date(doc['start-date'])
            .toJSON()
            .slice(0, 10)
            .replace(/-/g, '/'),
          endDate: new Date(doc['expire-date'])
            .toJSON()
            .slice(0, 10)
            .replace(/-/g, '/'),
          annexes: doc['operator-document-annexes']
            ? doc['operator-document-annexes']
            : [],
        };
      }
    }

    return contractSignature;
  }
);

export { getParsedDocumentation, getContractSignatureDocumentation };
