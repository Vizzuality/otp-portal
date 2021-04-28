import { createSelector } from 'reselect';

// Get the datasets and filters from state
const observations = (state) => state.observations;

// Create a function to compare the current active datatasets and the current datasetsIds
const getParsedChartObservations = createSelector(
  observations,
  (_observations) => {
    if (_observations.data && _observations.data.length) {
      return _observations.data.map((obs) => ({
        id: obs.id,
        details: obs.details,
        level: obs.severity && obs.severity.level,
        category: obs?.subcategory?.category?.name || '',
        illegality: obs?.subcategory?.name || '',
        date: new Date(obs['publication-date']),
      }));
    }

    return [];
  }
);

export { getParsedChartObservations };
