import React from 'react';
import PropTypes from 'prop-types';

class CertificationsTd extends React.Component {
  static defaultProps = {
    fmus: []
  };

  static propTypes = {
    fmus: PropTypes.array
  };

  render() {
    const { fmus } = this.props;
    const fsc = fmus.filter(f => f['certification-fsc']).length;
    const olb = fmus.filter(f => f['certification-olb']).length;
    const pefc = fmus.filter(f => f['certification-pefc']).length;
    const pafc = fmus.filter(f => f['certification-pafc']).length;
    const fsccw = fmus.filter(f => f['certification-fsc-cw']).length;
    const tlv = fmus.filter(f => f['certification-tlv']).length;
    const ls = fmus.filter(f => f['certification-ls']).length;

    if (!fsc && !olb && !pefc && pafc && fsccw && tlv && ls) {
      return (
        <div className="certifications-td">
          <p>-</p>
        </div>
      );
    }

    return (
      <div className="certifications-td">
        {!!fsc && <p>FSC ({fsc})</p>}
        {!!olb && <p>OLB ({olb})</p>}
        {!!pefc && <p>PEFC ({pefc})</p>}
        {!!pafc && <p>PAFC ({pafc})</p>}
        {!!fsccw && <p>FSC-CW ({fsccw})</p>}
        {!!tlv && <p>TLV ({tlv})</p>}
        {!!ls && <p>LS ({ls})</p>}
      </div>
    );
  }
}


export default CertificationsTd;
