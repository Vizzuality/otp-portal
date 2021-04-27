import { createSelector } from 'reselect';

import isEmpty from 'lodash/isEmpty';
import flatten from 'lodash/flatten';
import sortBy from 'lodash/sortBy';

// Get the datasets and filters from state
const getFilters = (state) => state.database.filters.data;
const getFilterOptions = (state) => state.database.filters.options;

// Create a function to compare the current active datatasets and the current datasetsIds
export const getParsedFilters = createSelector(
  getFilters,
  getFilterOptions,
  (filters, options) => {
    let newFilterOptions = options;

    if (
      filters.country_ids &&
      !!filters.country_ids.length &&
      !isEmpty(options)
    ) {
      const activeCountries = options.country_ids.filter((c) =>
        filters.country_ids.map((i) => +i).includes(c.id)
      );

      newFilterOptions = {
        ...newFilterOptions,
        operator_id: sortBy(
          flatten(
            activeCountries.map((c) =>
              newFilterOptions.operator_id.filter((o) => c.operators.includes(o.id))
            )
          ),
          'name'
        ),
        fmu_id: sortBy(
          flatten(
            activeCountries.map((c) =>
              newFilterOptions.fmu_id.filter((f) => c.fmus.includes(f.id))
            )
          ),
          'name'
        ),
        required_operator_document_id: sortBy(
          flatten(
            activeCountries.map((c) =>
              newFilterOptions.required_operator_document_id.filter((f) => c.required_operator_document_ids.includes(f.id))
            )
          ),
          'name'
        ),
        forest_types: sortBy(
          flatten(
            activeCountries.map((c) =>
              newFilterOptions.forest_types.filter((f) => c.forest_types.map(f1 => f1.id).includes(f.id))
            )
          ),
          'name'
        ),
      };
    }

    if (filters.operator_id && !!filters.operator_id.length) {
      const activeOperators = options.operator_id.filter((c) =>
        filters.operator_id.map((i) => +i).includes(c.id)
      );

      newFilterOptions = {
        ...newFilterOptions,
        fmu_id: sortBy(
          flatten(
            activeOperators.map((o) =>
              newFilterOptions.fmu_id.filter((f) => o.fmus.includes(f.id))
            )
          ),
          'name'
        ),
      };
    }

    if (filters.legal_categories && !!filters.legal_categories.length) {
      const activeLegalCategories = options.legal_categories.filter((c) =>
        filters.legal_categories.map((i) => +i).includes(c.id)
      );

      newFilterOptions = {
        ...newFilterOptions,
        required_operator_document_id: sortBy(
          flatten(
            activeLegalCategories.map((o) =>
              newFilterOptions.required_operator_document_id.filter((f) => o.required_operator_document_ids.includes(f.id))
            )
          ),
          'name'
        ),
      };
    }


    return {
      data: filters,
      options: newFilterOptions,
    };
  }
);
