import omit from 'lodash/omit';
import groupBy from 'lodash/groupBy';
import flatten from 'lodash/flatten';
import sortBy from 'lodash/sortBy';
import uniqBy from 'lodash/uniqBy';

// Constants
import { PALETTE_COLOR_2 } from 'constants/rechart';

export const PALETTE = {
  doc_not_provided: {
    label: 'Not provided',
    fill: PALETTE_COLOR_2[0].fill,
    stroke: PALETTE_COLOR_2[0].fill
  },
  doc_invalid: {
    label: 'Provided (not valid)',
    fill: PALETTE_COLOR_2[1].fill,
    stroke: PALETTE_COLOR_2[1].fill,
    user: true
  },
  doc_valid: {
    label: 'Provided (valid)',
    fill: PALETTE_COLOR_2[2].fill,
    stroke: PALETTE_COLOR_2[2].fill
  },
  doc_pending: {
    label: 'Pending for approval',
    fill: PALETTE_COLOR_2[3].fill,
    stroke: PALETTE_COLOR_2[3].fill,
    user: true
  },
  doc_expired: {
    label: 'Expired',
    fill: PALETTE_COLOR_2[4].fill,
    stroke: PALETTE_COLOR_2[4].fill
  },
  doc_not_required: {
    label: 'Not required',
    fill: PALETTE_COLOR_2[5].fill,
    stroke: PALETTE_COLOR_2[5].fill
  }
};


const HELPERS_DOC = {
  getMetadata() {
    return JSON.parse(JSON.stringify(PALETTE));
  },

  getPercentage(data) {
    // return round(Math.random() * 100, 2);
    if (data['percentage-valid-documents-all']) {
      let per = data['percentage-valid-documents-all'] * 100;
      per = per.toFixed(2).replace(/[.,]00$/, '');
      return per || 0;
    }

    if (data['percentage-valid-documents']) {
      let per = data['percentage-valid-documents'] * 100;
      per = per.toFixed(2).replace(/[.,]00$/, '');
      return per || 0;
    }

    return 0;
  },

  getGroupedByType(data) {
    return groupBy(data, 'type');
  },

  getGroupedByForestType(data) {
    const groups = groupBy(data, (d) => {
      const { fmu, type } = d;

      if (type === 'operator-document-fmus') {
        const { 'forest-type': forestType } = fmu;
        return forestType;
      }
      return type;
    });

    return omit(groups, 'operator-document-countries');
  },


  getGroupedByCategory(data) {
    const lookup = sortBy(uniqBy(data, 'category'), 'categoryPosition').map(item => item.category);
    const childObj = groupBy(data, 'category');
    const parentObj = {};

    for (let i = 0; i < lookup.length; ++i) {
      parentObj[lookup[i]] = childObj[lookup[i]];
    }

    return parentObj;
  },

  getGroupedByStatus(data) {
    return groupBy(data, 'status');
  },

  getGroupedByFmu(data) {
    return groupBy(data, d => d.fmu.id);
  },

  getFMUName(data, id) {
    return uniqBy(data.map(doc => doc.fmu), 'id').filter(fmu => fmu.id === id)[0].name;
  },

  getGroupedByStatusChart(data) {
    if (data.length) {
      const length = data.length;
      const groupedByStatus = this.getGroupedByStatus(data);

      return flatten(Object.keys(groupedByStatus).map(status => [
        {
          id: status,
          label: PALETTE[status].label,
          value: parseFloat(((groupedByStatus[status].length / length) * 100).toFixed(2).replace(/[.,]00$/, '')) || 0,
          fill: PALETTE[status].fill,
          stroke: PALETTE[status].stroke
        }
      ]));
    }

    return [];
  },

  getPercentageOfValidDocumentation(data) {
    const grouped = this.getGroupedByStatus(data);
    return (grouped.doc_valid) ? ((grouped.doc_valid.length / data.length) * 100).toFixed(2) : 0;
  },

  getMaxLength(data) {
    const arr = Object.keys(data).map(k => data[k].length);
    return Math.max(...arr);
  }
};

export { HELPERS_DOC };
