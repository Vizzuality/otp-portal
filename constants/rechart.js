const PALETTE_COLOR_1 = [
  { fill: '#D2CFCF' },
  { fill: '#2D9A56' },
  { fill: '#31312E' },
  { fill: '#E98300' }
];
const PALETTE_COLOR_2 = [
  { fill: '#e98300', stroke: '#e98300' },
  { fill: '#F3D3A5', stroke: '#F3D3A5' },
  { fill: '#005b23', stroke: '#005b23' },
  { fill: '#88bf9d', stroke: '#88bf9d' },
  { fill: '#de2239', stroke: '#de2239' },
  { fill: '#333333', stroke: '#333333' }
];

const PALETTE_COLOR_3 = [
  { fill: '#e98300', stroke: '#e98300' },
  { fill: '#32794C', stroke: '#32794C' },
  { fill: '#005b23', stroke: '#005b23' }
];

const ANIMATION_TIMES = {
  animationBegin: 250,
  animationDuration: 500,
  animationEasing: 'ease-in-out'
};

const LEGEND_CHRONOLOGICAL = {
  list: [{
    fill: PALETTE_COLOR_3[0].fill,
    stroke: PALETTE_COLOR_3[0].fill,
    label: 'doc_not_provided'
  }, {
    fill: PALETTE_COLOR_3[1].fill,
    stroke: PALETTE_COLOR_3[1].fill,
    label: 'doc_was_valid'
  }, {
    fill: PALETTE_COLOR_3[2].fill,
    stroke: PALETTE_COLOR_3[2].fill,
    label: 'doc_valid'
  }]
};

const LEGEND_SEVERITY = {
  title: 'SEVERITY',
  list: [{
    fill: PALETTE_COLOR_1[3].fill,
    stroke: PALETTE_COLOR_1[3].fill,
    label: 'high'
  }, {
    fill: PALETTE_COLOR_1[2].fill,
    stroke: PALETTE_COLOR_1[2].fill,
    label: 'medium'
  }, {
    fill: PALETTE_COLOR_1[1].fill,
    stroke: PALETTE_COLOR_1[1].fill,
    label: 'low'
  }, {
    fill: PALETTE_COLOR_1[0].fill,
    stroke: PALETTE_COLOR_1[0].fill,
    label: 'unknown'
  }]
};

const LEGEND_DOCUMENTATION = {
  list: [{
    fill: PALETTE_COLOR_2[0].fill,
    stroke: PALETTE_COLOR_2[0].stroke,
    label: 'Not provided'
  }, {
    fill: PALETTE_COLOR_2[1].fill,
    stroke: PALETTE_COLOR_2[1].stroke,
    label: 'Provided (not valid)'
  }, {
    fill: PALETTE_COLOR_2[2].fill,
    stroke: PALETTE_COLOR_2[2].stroke,
    label: 'Provided (valid)'
  }, {
    fill: PALETTE_COLOR_2[3].fill,
    stroke: PALETTE_COLOR_2[3].stroke,
    label: 'Pending approval'
  }, {
    fill: PALETTE_COLOR_2[4].fill,
    stroke: PALETTE_COLOR_2[4].stroke,
    label: 'Expired'
  }]
};

export { PALETTE_COLOR_1, PALETTE_COLOR_2, ANIMATION_TIMES, LEGEND_SEVERITY, LEGEND_DOCUMENTATION, LEGEND_CHRONOLOGICAL };
