import groupBy from 'lodash/groupBy';
import flatten from 'lodash/flatten';

const HELPERS_OBS = {
  // Groups
  getGroupedByYear(data) {
    return groupBy(data, (d) => d.date);
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
      data.filter((d) => !!d.fmu),
      (d) => {
        return d.fmu.name;
      }
    );

    return groupedByFmu;
  },

  getGroupedBySeverity(data, raw, lookupKey) {
    const key = lookupKey || 'level';
    const grouped = groupBy(data, key);
    if (raw) {
      return grouped;
    }
    return [
      {
        hight: grouped[3] ? grouped[3].length : 0,
        medium: grouped[2] ? grouped[2].length : 0,
        low: grouped[1] ? grouped[1].length : 0,
        unknown: grouped[0] ? grouped[0].length : 0,
      },
    ];
  },

  getGroupedByIllegality(data) {
    // TODO: change countries too
    return groupBy(data, 'subcategory');
  },

  // Values
  getMaxValue(data) {
    const arr = flatten(
      Object.keys(data || this.props.data).map((k) => {
        const groupedBySeverity = groupBy(data[k], 'level');
        return Object.keys(groupedBySeverity).map(
          (s) => groupedBySeverity[s].length
        );
      })
    );

    return Math.max(...arr);
  },

  getMaxLength(data) {
    const arr = Object.keys(data).map((k) => data[k].length);
    return Math.max(...arr);
  },

  // Years
  getYears(data) {
    const years = Object.keys(groupBy(data, (d) => d.date));
    return years
      .sort((a, b) => b - a)
      .map((year) => ({ label: year, value: year }));
  },

  getMaxYear(data) {
    const years = Object.keys(groupBy(data, (d) => d.date));
    return Math.max(...years);
  },

  // Monitors
  getMonitorVisits(data) {
    const dates = groupBy(data.map((o) => o.date));
    return Object.keys(dates).length;
  },

  getAvgObservationByMonitors(data) {
    const dates = groupBy(data.map((o) => o.date));

    const avg =
      Object.keys(dates).reduce((sum, k) => sum + dates[k].length, 0) /
      (Object.keys(dates).length || 1);
    return avg.toFixed(2);
  },
};

function getLocation(obs = {}) {
  if (obs.lat && obs.lng) {
    return {
      lat: Number(obs.lat),
      lng: Number(obs.lng),
    };
  }

  if (obs.country && obs.country['country-centroid']) {
    const centroid = obs.country['country-centroid'];

    return {
      lat: centroid.coordinates[0],
      lng: centroid.coordinates[1],
    };
  }

  return {};
}

function parseObservations(data) {
  return data.map((obs) => {
    const evidence =
      obs['evidence-type'] !== 'Evidence presented in the report'
        ? obs['observation-documents']
        : obs['evidence-on-report'];

    return {
      category: obs?.subcategory?.category?.name || '',
      country: obs.country?.iso || '',
      date: new Date(obs['publication-date']).getFullYear(),
      // date: new Date(obs['publication-date']),
      details: obs.details,
      evidence,
      fmu: obs.fmu,
      id: obs.id,
      level: obs.severity && obs.severity.level,
      operator: !!obs.operator && obs.operator.name,
      observation: obs.details,
      location: getLocation(obs),
      'location-accuracy': obs['location-accuracy'],
      'operator-type': obs.operator && obs.operator['operator-type'],
      report: obs['observation-report']
        ? obs['observation-report'].attachment.url
        : null,
      subcategory: obs?.subcategory?.name || '',
      status: obs['validation-status-id'],
      'litigation-status': obs['litigation-status'],
      'observer-types': obs.observers.map(
        (observer) => observer['observer-type']
      ),
      'observer-organizations': obs.observers,
      'relevant-operators': obs['relevant-operators'].map((o) => o.name),
    };
  });
}

export { HELPERS_OBS, parseObservations };
