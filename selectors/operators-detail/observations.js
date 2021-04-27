import { createSelector } from 'reselect';
import { parseObservations } from 'utils/observations';

// Get the datasets and filters from state
const operatorsDetail = (state) => state.operatorsDetail;

// Create a function to compare the current active datatasets and the current datasetsIds
const getParsedObservations = createSelector(
  operatorsDetail,
  (_operatorsDetail) => {
    if (_operatorsDetail.data.observations) {
      return parseObservations(
        _operatorsDetail.data.observations.map((obs) => ({
          ...obs,
          operator: { name: _operatorsDetail.data.name },
        }))
      );
    }

    return [];
  }
);

export { getParsedObservations };
