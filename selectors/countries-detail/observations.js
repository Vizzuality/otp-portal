import { createSelector } from 'reselect';

// Get the datasets and filters from state
const countriesDetail = state => state.countriesDetail;

// Create a function to compare the current active datatasets and the current datasetsIds
const getParsedObservations = createSelector(
  countriesDetail,
  (_countriesDetail) => {
    if (_countriesDetail.observations && !!_countriesDetail.observations.data.length) {
      const observations = _countriesDetail.observations.data.map(obs => ({
        id: obs.id,
        details: obs.details,
        severity: obs.severity.level,
        category: obs.subcategory.category.name,
        illegality: obs.subcategory.name,
        date: new Date(obs['publication-date']),
        report: obs['observation-report'],
        documents: obs['observation-documents'] || []
      }));

      return observations;
    }

    return [];
  }
);

export { getParsedObservations };
