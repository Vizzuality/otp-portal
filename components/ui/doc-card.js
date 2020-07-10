import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
// import Tooltip from 'rc-tooltip';
import Tooltip from 'rc-tooltip/dist/rc-tooltip';

// Intl
import { connect } from 'react-redux';
import { injectIntl, intlShape } from 'react-intl';

// Services
import modal from 'services/modal';
import DocumentationService from 'services/documentationService';

// Components
import DocInfoModal from 'components/ui/doc-info-modal';
import DocNotRequiredModal from 'components/ui/doc-notrequired-modal';
import DocAnnexesModal from 'components/ui/doc-annexes-modal';
import Icon from 'components/ui/icon';
import Spinner from 'components/ui/spinner';

class DocCard extends React.Component {
  static propTypes = {
    user: PropTypes.object,
    url: PropTypes.string,
    status: PropTypes.string,
    public: PropTypes.bool,
    title: PropTypes.string,
    explanation: PropTypes.string,
    startDate: PropTypes.string,
    endDate: PropTypes.string,
    properties: PropTypes.object,
    annexes: PropTypes.array,
    layout: PropTypes.shape({}),
    intl: intlShape.isRequired,
    onChange: PropTypes.func
  };

  static defaultProps = {
    annexes: [],
    layout: {
      info: true,
      annexes: true
    }
  }

  constructor(props) {
    super(props);

    this.documentationService = new DocumentationService();
  }

  state = {
    deleteLoading: false
  }


  triggerWhy = (e) => {
    e && e.preventDefault();

    modal.toggleModal(true, {
      children: DocNotRequiredModal,
      childrenProps: {
        ...this.props,
        onChange: () => {
          this.props.onChange && this.props.onChange();
        }
      }
    });
  }

  triggerAddAnnexModal = () => {
    modal.toggleModal(true, {
      children: DocAnnexesModal,
      childrenProps: {
        ...this.props,
        onChange: () => {
          this.props.onChange && this.props.onChange();
        }
      }

    });
  }

  triggerRemoveAnnex = (id) => {
    const { user } = this.props;

    this.setState({ deleteLoading: true });

    this.documentationService.deleteAnnex(id, user)
      .then(() => {
        this.setState({ deleteLoading: false });
        this.props.onChange && this.props.onChange();
      })
      .catch((err) => {
        this.setState({ deleteLoading: false });
        console.error(err);
      });
  }

  render() {
    const { user, public: publicState, startDate, endDate, status, title, explanation, url, annexes, layout, properties } = this.props;
    const { id } = properties;
    const { deleteLoading } = this.state;
    const isActiveUser = (user && user.role === 'admin') ||
      (user && user.role === 'operator' && user.operator && user.operator.toString() === id) ||
      (user && user.role === 'government' && user.country && user.country.toString() === id);

    const approvedAnnexes = annexes.filter(a => a.name);

    const classNames = classnames({
      [`-${status}`]: !!status
    });

    return (
      <div className={`c-doc-card ${classNames}`}>
        {!publicState && isActiveUser &&
          <div className="doc-card-private">
            {this.props.intl.formatMessage({ id: 'private' })}
          </div>
        }

        {layout.info &&
          <div className="doc-card-info">
            <button
              className="c-button -clean -icon"
              onClick={() => {
                modal.toggleModal(true, {
                  children: DocInfoModal,
                  childrenProps: {
                    title,
                    explanation
                  }
                });
              }}
            >
              <Icon
                name="icon-info"
                className="-smaller"
              />
            </button>
          </div>
        }

        {!!url && status !== 'doc_not_provided' &&
          <div className="doc-card-content-container">
            <header className="doc-card-header">
              {startDate !== endDate &&
                <div className="doc-card-date">{endDate}</div>
              }
              <div className="doc-card-status">{this.props.intl.formatMessage({ id: status })}</div>
            </header>
            <div className="doc-card-content">
              <a rel="noopener noreferrer" target="_blank" href={url}>
                <h3 className="doc-card-title c-title -big">
                  {title}
                </h3>
              </a>
            </div>
            <div className="doc-card-footer">
              {layout.annexes &&
                <div>
                  <h3 className="c-title -default doc-card-annexes-title">{this.props.intl.formatMessage({ id: 'annexes' })}:</h3>
                  <ul className="doc-card-list">
                    {approvedAnnexes.map(annex => (
                      <li className="doc-card-list-item" key={annex.id}>
                        <Tooltip
                          placement="bottom"
                          overlay={
                            <div>
                              <Spinner isLoading={deleteLoading} className="-tiny -transparent" />
                              <h4 className="c-title -default tooltip-title">{annex.name}</h4>
                              <dl className="tooltip-content">
                                <dt><strong>{this.props.intl.formatMessage({ id: 'annex.start_date' })}:</strong></dt>
                                <dd>{annex['start-date'] ? annex['start-date'] : '-' }</dd>
                                <dt><strong>{this.props.intl.formatMessage({ id: 'annex.expiry_date' })}:</strong></dt>
                                <dd>{annex['expire-date'] ? annex['expire-date'] : '-'}</dd>
                              </dl>
                              <div className="tooltip-footer">
                                {annex.attachment &&
                                  <a href={annex.attachment.url} target="_blank" rel="noopener noreferrer" className="c-button -small -tooltip">{this.props.intl.formatMessage({ id: 'file' })}</a>
                                }
                                {isActiveUser &&
                                  <button
                                    className="c-button -small -tooltip -tooltip-secondary"
                                    type="button"
                                    onClick={() => this.triggerRemoveAnnex(annex.id)}
                                  >
                                    <span className="tooltip-hidden-button-text">{this.props.intl.formatMessage({ id: 'annex.remove' })}</span>
                                    <Icon className="" name="icon-bin" />
                                  </button>
                                }
                              </div>
                            </div>
                          }
                          overlayClassName="c-tooltip"
                        >
                          <button
                            className="c-button"
                            type="button"
                          >
                            <Icon className="" name="icon-file-empty" />
                          </button>
                        </Tooltip>
                      </li>
                    ))}
                    {isActiveUser &&
                      <li className="doc-card-list-button" key="add-annex">
                        <button
                          className="c-button -small -secondary"
                          type="button"
                          onClick={this.triggerAddAnnexModal}
                        >
                          <span className="doc-card-hidden-button-text">Add an annex</span>
                          <Icon className="" name="icon-plus" />
                        </button>
                      </li>
                    }
                  </ul>
                  {!approvedAnnexes.length &&
                    <p className="doc-card-annex-text">No annexes</p>
                  }
                </div>
              }
            </div>
          </div>
        }
        {!url && status !== 'doc_not_provided' && status !== 'doc_not_required' &&
          <div>
            <header className="doc-card-header">
              {startDate !== endDate &&
                <div className="doc-card-date">{endDate}</div>
              }
              <div className="doc-card-status">{this.props.intl.formatMessage({ id: status })}</div>
            </header>
            <div className="doc-card-content">
              <h3 className="doc-card-title c-title -big">
                {title}
              </h3>
            </div>
          </div>
        }

        {status === 'doc_not_provided' &&
          <div>
            <header className="doc-card-header">
              <div className="doc-card-status">{this.props.intl.formatMessage({ id: status })}</div>
            </header>
            <div className="doc-card-content">
              <h3 className="doc-card-title c-title -big">
                {title}
              </h3>
            </div>
          </div>
        }

        {status === 'doc_not_required' &&
          <div>
            <header className="doc-card-header">
              <div className="doc-card-status">{this.props.intl.formatMessage({ id: status })}</div>
              <div className="doc-card-why">
                <button onClick={this.triggerWhy} className="c-button -small -clean">
                  {this.props.intl.formatMessage({ id: 'why' })}
                </button>
              </div>
            </header>
            <div className="doc-card-content">
              <h3 className="doc-card-title c-title -big">
                {title}
              </h3>
            </div>
          </div>
        }
      </div>
    );
  }
}

export default injectIntl(connect(
  state => ({
    user: state.user
  })
)(DocCard));
