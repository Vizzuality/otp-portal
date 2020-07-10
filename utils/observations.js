import groupBy from 'lodash/groupBy';
import flatten from 'lodash/flatten';

const HELPERS_OBS = {
  // Groups
  getGroupedByYear(data) {
    return groupBy(data, d => d.date.getFullYear());
  },

  getGroupedByCategory(data, year) {
    if (year) {
      const groupedByYear = this.getGroupedByYear(data);
      return groupBy(groupedByYear[year], 'category');
    }
    return groupBy(data, 'category');
  },

  getGroupedByFMU(data) {
    const groupedByFmu = groupBy(
      data.filter(d => !!d.fmu),
      (d) => {
        return d.fmu.name;
      }
    );

    return groupedByFmu;
  },


  getGroupedBySeverity(data, raw) {
    const grouped = groupBy(data, 'severity');
    if (raw) {
      return grouped;
    }
    return [{
      hight: (grouped[3]) ? grouped[3].length : 0,
      medium: (grouped[2]) ? grouped[2].length : 0,
      low: (grouped[1]) ? grouped[1].length : 0,
      unknown: (grouped[0]) ? grouped[0].length : 0
    }];
  },

  getGroupedByIllegality(data) {
    return groupBy(data, 'illegality');
  },

  // Values
  getMaxValue(data) {
    const arr = flatten(Object.keys(data || this.props.data).map((k) => {
      const groupedBySeverity = groupBy(data[k], 'severity');
      return Object.keys(groupedBySeverity).map(s => groupedBySeverity[s].length);
    }));

    return Math.max(...arr);
  },

  getMaxLength(data) {
    const arr = Object.keys(data).map(k => data[k].length);
    return Math.max(...arr);
  },

  // Years
  getYears(data) {
    const years = Object.keys(groupBy(data, d => d.date.getFullYear()));
    return years.sort((a, b) => b - a).map(year => ({ label: year, value: year }));
  },

  getMaxYear(data) {
    const years = Object.keys(groupBy(data, d => d.date.getFullYear()));
    return Math.max(...years);
  },


  // Monitors
  getMonitorVisits(data) {
    const dates = groupBy(data.map(o =>
      o.date.toJSON().slice(0, 10).replace(/-/g, '/')
    ));
    return Object.keys(dates).length;
  },

  getAvgObservationByMonitors(data) {
    const dates = groupBy(data.map(o =>
      o.date.toJSON().slice(0, 10).replace(/-/g, '/')
    ));

    const avg = Object.keys(dates).reduce((sum, k) =>
      sum + dates[k].length, 0) / (Object.keys(dates).length || 1
    );
    return avg.toFixed(2);
  }
};

export { HELPERS_OBS };
