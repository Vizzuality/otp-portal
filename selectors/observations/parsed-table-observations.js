import { createSelector } from 'reselect';

// Get the datasets and filters from state
const observations = state => state.observations;

const getLocation = (obs = {}) => {
  if (obs.lat && obs.lng) {
    return {
      lat: Number(obs.lat),
      lng: Number(obs.lng)
    };
  }

  if (obs.country && obs.country['country-centroid']) {
    const centroid = obs.country['country-centroid'];

    return {
      lat: centroid.coordinates[0],
      lng: centroid.coordinates[1]
    };
  }


  return {};
};

// Create a function to compare the current active datatasets and the current datasetsIds
const getParsedTableObservations = createSelector(
  observations,
  (_observations) => {
    if (_observations.data && _observations.data.length) {
      return _observations.data.map((obs) => {
        const evidence = (obs['evidence-type'] !== 'Evidence presented in the report') ? obs['observation-documents'] : obs['evidence-on-report'];

        return {
          id: obs.id,
          date: new Date(obs['publication-date']).getFullYear(),
          country: obs.country.iso,
          operator: !!obs.operator && obs.operator.name,
          category: obs.subcategory.category.name,
          observation: obs.details,
          level: obs.severity.level,
          fmu: !!obs.fmu && obs.fmu.name,
          report: obs['observation-report'] ? obs['observation-report'].attachment.url : null,
          location: getLocation(obs),
          'location-accuracy': obs['location-accuracy'],
          'operator-type': obs.operator && obs.operator.type,
          subcategory: obs.subcategory.name,
          evidence,
          status: obs['validation-status-id'],
          'litigation-status': obs['litigation-status'],
          'observer-types': obs.observers.map(observer => observer['observer-type']),
          'observer-organizations': obs.observers.map(observer => observer.name || observer.organization),
          'relevant-operators': obs['relevant-operators'].map(o => o.name)
        };
      });
    }

    return [];
  }
);

export { getParsedTableObservations };
