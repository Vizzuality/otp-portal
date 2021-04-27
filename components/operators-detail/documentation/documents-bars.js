import { injectIntl } from 'react-intl';
import sortBy from 'lodash/sortBy';
import { HELPERS_DOC } from 'utils/documentation';

function DocumentStatusBar({
  category,
  className,
  docs,
  maxDocs,
  intl
}) {
  const groupedByStatus = HELPERS_DOC.getGroupedByStatus(docs);
  delete groupedByStatus.doc_not_required;

  // if (groupedByStatus.doc_not_required?.length) {
  //   // move all doc_not_required to doc_valid
  //   groupedByStatus.doc_valid = groupedByStatus.doc_valid?.length
  //     ? [...groupedByStatus.doc_valid, ...groupedByStatus.doc_not_required]
  //     : groupedByStatus.doc_not_required;
  //
  // }

  const validDocs = groupedByStatus.doc_valid?.length || 0;
  const docsLenght = docs.filter(d => d.status !== 'doc_not_required').length;

  return (
    <div className={`c-doc-by-category ${className || ''}`}>
      <div className="doc-by-category-desc">
        <div className="doc-by-category-chart">
          <div className="doc-by-category-bar">
            {sortBy(Object.keys(groupedByStatus)).map((status) => {
              let segmentWidth = (groupedByStatus[status].length / docsLenght) * (docsLenght / (maxDocs || docsLenght)) * 100;

              if (!docsLenght) {
                segmentWidth = 100;
              }

              return (
                <div
                  key={status}
                  className={`doc-by-category-bar-segment -${status}`}
                  style={{ width: 215 * (segmentWidth/100) }}
                />
              );
            })}
          </div>

          <span>{`${
            groupedByStatus.doc_valid
              ? ((validDocs / docsLenght) * 100).toFixed(0)
              : 0
          }% ${intl.formatMessage({ id: 'doc_valid' })}`}</span>
        </div>
        <h3 className="c-title -proximanova -extrabig -uppercase">
          {category}
        </h3>
      </div>
    </div>
  );
}

export default injectIntl(DocumentStatusBar);