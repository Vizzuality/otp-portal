import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import ReactTable from 'react-table/react-table';

export default function Table({ data, options, className }) {
  const classNames = classnames({
    [className]: !!className
  });

  return (
    <div className={`c-table ${classNames}`}>
      <ReactTable
        data={data}
        className={`table ${classNames}`}
        columns={options.columns}
        defaultPageSize={options.pageSize}
        pageSize={options.pageSize}
        showPagination={options.pagination}
        page={options.page}
        previousText={options.previousText}
        nextText={options.nextText}
        noDataText={options.noDataText}
        pages={options.pages}
        showPageSizeOptions={options.showPageSizeOptions}
        sortable
        resizable={false}
        minRows={0}
        // Api pagination & sort
        // manual={options.manual}
        onPageChange={options.onPageChange}
        defaultSorted={options.defaultSorted}
        SubComponent={options.showSubComponent && options.subComponent}
      />
    </div>
  );
}

Table.defaultProps = {
  data: [],
  options: {}
};

Table.propTypes = {
  data: PropTypes.array,
  options: PropTypes.object,
  className: PropTypes.string
};
