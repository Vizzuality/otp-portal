import { createSelector } from 'reselect';
import { parseObservations } from 'utils/observations';

// Get the datasets and filters from state
const observations = (state) => state.observations;

// Create a function to compare the current active datatasets and the current datasetsIds
const getParsedTableObservations = createSelector(
  observations,
  (_observations) => {
    if (_observations.data && _observations.data.length) {
      return parseObservations(_observations.data);
    }

    return [];
  }
);

export { getParsedTableObservations };
