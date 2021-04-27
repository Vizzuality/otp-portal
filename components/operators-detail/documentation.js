import React from 'react';
import PropTypes from 'prop-types';
import sortBy from 'lodash/sortBy';

// Intl
import { injectIntl, intlShape } from 'react-intl';

// Utils
import { HELPERS_DOC } from 'utils/documentation';

// Components
import DocumentsCertification from 'components/operators-detail/documentation/documents-certification';
import DocumentsProvided from 'components/operators-detail/documentation/documents-provided';
import DocumentsByOperator from 'components/operators-detail/documentation/documents-by-operator';
import DocumentsTimeline from 'components/operators-detail/documentation/documents-timeline';
import DocumentStatusBar from 'components/operators-detail/documentation/documents-bars';
import DocumentsFilter from 'components/operators-detail/documentation/documents-filter';

function OperatorsDetailDocumentation({
  operatorsDetail,
  operatorDocumentation,
  operatorTimeline,
  url,
  intl,
}) {
  const docsGroupedByCategory = HELPERS_DOC.getGroupedByCategory(
    operatorDocumentation
  );
  // Maximum amount of documents in a category, other bars will be proportional to it
  const maxDocs = Object.values(docsGroupedByCategory)
    .map((categoryDocs) => categoryDocs.length)
    .sort((a, b) => a - b)
    .reverse()[0];

  const filteredData = operatorDocumentation.filter(
    (d) => d.status !== 'doc_not_required'
  );
  const groupedByStatusChart = HELPERS_DOC.getGroupedByStatusChart(
    filteredData
  );
  const validDocs = groupedByStatusChart.find(
    (status) => status.id === 'doc_valid'
  );

  return (
    <div>
      <div className="c-section">
        <div className="l-container">
          <DocumentsFilter showDate showFMU />

          <DocumentsCertification
            // Publication authorization
            id={url.query.id}
          />

          <article className="c-article">
            <header>
              {/* X % valid documents available */}
              <h2 className="c-title">
                {intl.formatMessage(
                  {
                    id: 'operator-detail.documents.title',
                  },
                  {
                    percentage: validDocs
                      ? validDocs.value
                      : 0,
                  }
                )}
              </h2>
            </header>

            <div className="content c-documentation-pie-chart">
              {/* Pie chart */}
              <DocumentsProvided
                data={filteredData}
                groupedByStatusChart={groupedByStatusChart}
              />
              <div className="pie-categories">
                {Object.entries(docsGroupedByCategory).map(
                  ([category, docs]) => (
                    <DocumentStatusBar
                      category={category}
                      docs={docs}
                      maxDocs={maxDocs}
                    />
                  )
                )}
              </div>
            </div>
          </article>

          {/* Timeline chart */}
          {operatorTimeline &&
            operatorTimeline.length &&
            operatorTimeline.length > 1 && (
              <DocumentsTimeline timelineData={operatorTimeline} />
            )}
        </div>
      </div>

      <div className="c-section">
        <div className="l-container">
          {/* Document sections with cards */}
          <DocumentsByOperator
            groupedByCategory={docsGroupedByCategory}
            id={url.query.id}
          />
        </div>
      </div>
    </div>
  );
}

OperatorsDetailDocumentation.propTypes = {
  operatorsDetail: PropTypes.object,
  operatorDocumentation: PropTypes.array,
  operatorTimeline: PropTypes.array,
  url: PropTypes.object,
  intl: intlShape.isRequired,
};

export default injectIntl(OperatorsDetailDocumentation);
