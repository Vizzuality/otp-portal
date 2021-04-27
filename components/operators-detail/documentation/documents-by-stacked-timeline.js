import React from 'react';
import PropTypes from 'prop-types';

// Redux
import { connect } from 'react-redux';
import { getDocuments } from 'modules/operators-detail';
import { getAllParsedDocumentation } from 'selectors/operators-detail/documentation';

import StackedTimeline from 'components/ui/stacked-timeline';

// Constants
import { LEGEND_CHRONOLOGICAL } from 'constants/rechart';

// Components
import Spinner from 'components/ui/spinner';
import ChartLegend from 'components/ui/chart-legend';

class DocumentsStackedTimeline extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
    };
  }

  componentDidMount() {
    const { id } = this.props;

    this.props.getDocuments(id);

    this.drawChart(this.props.documentation);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.documentation.length !== this.props.documentation.length) {
      this.drawChart(nextProps.documentation);
    }
  }

  componentWillUnmount() {
    delete this.chartInstance;
  }

  drawChart(data) {
    if (data.length) {
      const selector = '#chart-stacked-timeline';
      // remove current chart if it exists
      document.querySelector(selector).innerHTML = '';

      this.chartInstance = new StackedTimeline(selector, data);
    }

    this.setState({
      loading: false,
    });
  }

  render() {
    return (
      <div className="c-stacked-timeline">
        <Spinner
          className="-transparent -small"
          isLoading={this.state.loading}
        />

        <ChartLegend
          list={LEGEND_CHRONOLOGICAL.list}
          className="-horizontal -no-gutter-top"
        />
        <div className="stacked-timeline-chart" id="chart-stacked-timeline" />
      </div>
    );
  }
}

DocumentsStackedTimeline.propTypes = {
  id: PropTypes.string,
  documentation: PropTypes.array,
  getDocuments: PropTypes.func,
};

export default connect(
  (state) => ({
    documentation: getAllParsedDocumentation(state),
  }),
  { getDocuments }
)(DocumentsStackedTimeline);
