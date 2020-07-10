import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import omit from 'lodash/omit';

// Intl
import { injectIntl, intlShape } from 'react-intl';

import Dropzone from 'react-dropzone';

// Components
import Spinner from 'components/ui/spinner';

import FormElement from './FormElement';

class File extends FormElement {
  constructor(props) {
    super(props);

    this.state = {
      ...this.state,
      accepted: [],
      rejected: [],
      dropzoneActive: false,
      loading: false
    };

    // BINDINGS
    this.triggerBrowseOrCancel = this.triggerBrowseOrCancel.bind(this);
    this.onDragEnter = this.onDragEnter.bind(this);
    this.onDragLeave = this.onDragLeave.bind(this);
    this.onDrop = this.onDrop.bind(this);
  }

  /**
   * DROPZONE EVENTS
   * - onDragEnter
   * - onDragLeave
   * - onDrop
  */
  onDragEnter() {
    this.setState({
      dropzoneActive: true
    });
  }

  onDragLeave() {
    this.setState({
      dropzoneActive: false
    });
  }

  onDrop(accepted, rejected) {
    if (accepted.length) {
      this.getBase64(accepted[0])
        .then((value) => {
          this.setState({
            value,
            accepted,
            rejected,
            dropzoneActive: false
          }, () => {
            // Publish the new value to the form
            if (this.props.onChange) this.props.onChange(this.state.value);
            // Trigger validation
            this.triggerValidate();
          });
        });
    }
  }

  /**
   * UI EVENTS
   * - triggerBrowseOrCancel
   * - triggerChange
  */
  triggerBrowseOrCancel() {
    const { accepted } = this.state;
    if (accepted.length) {
      this.setState({
        accepted: [],
        value: ''
      }, () => {
        // Publish the new value to the form
        if (this.props.onChange) this.props.onChange(this.state.value);
        // Trigger validation
        this.triggerValidate();
      });
    } else {
      this.dropzone.open();
    }
  }

  triggerChange(e) {
    this.setState({
      value: e.currentTarget.value
    }, () => {
      // Publish the new value to the form
      if (this.props.onChange) this.props.onChange(this.state.value);
      // Trigger validation
      this.triggerValidate();
    });
  }

  /**
   * HELPERS
   * - getFileName
   * @return {String}
  */
  getFileName() {
    const { properties } = this.props;
    const { accepted } = this.state;

    if (accepted.length) {
      const current = accepted[0];
      return current.name;
    }

    if (properties.defaultFile) {
      return properties.defaultFile;
    }

    return this.props.intl.formatMessage({ id: 'select-file' });
  }

  /**
   * - getBase64
   * @param  {File} file
   * @return {String} bs64
  */
  getBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        resolve(reader.result);
      };
      reader.onerror = (error) => {
        reject(error);
      };
    });
  }

  render() {
    const { properties } = this.props;
    const { accepted, loading } = this.state;

    const inputClassName = classnames({
      [properties.className]: !!properties.className
    });

    return (
      <div className="c-file">
        <Dropzone
          ref={(node) => { this.dropzone = node; }}
          className="file-dropzone"
          multiple={false}
          disableClick
          disablePreview
          onDrop={this.onDrop}
          onDragEnter={this.onDragEnter}
          onDragLeave={this.onDragLeave}
        >
          {/* {dropzoneActive &&
            <div className="dropzone-active">
              Drop files...
            </div>
          } */}

          <input
            {...omit(properties, 'authorization')}
            className={`input ${inputClassName}`}
            value={this.getFileName()}
            id={`input-${properties.name}`}
            readOnly={!!accepted.length}
            onChange={this.triggerChange}
          />

          <button
            type="button"
            className="c-button -primary -compressed file-button"
            onClick={this.triggerBrowseOrCancel}
          >
            <Spinner className="-light -small" isLoading={loading} />
            {(accepted.length) ?
              this.props.intl.formatMessage({ id: 'cancel' }) :
              this.props.intl.formatMessage({ id: 'browse-file' })
            }
          </button>
        </Dropzone>
      </div>
    );
  }
}

File.propTypes = {
  properties: PropTypes.object.isRequired,
  onChange: PropTypes.func,
  intl: intlShape.isRequired
};

export default injectIntl(File, { withRef: true });
