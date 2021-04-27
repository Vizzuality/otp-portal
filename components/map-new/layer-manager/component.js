import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

import { LayerManager, Layer } from 'layer-manager/dist/components';
import { PluginMapboxGl, fetch } from 'layer-manager';

import omit from 'lodash/omit';
import slugify from 'slugify';

class LayerManagerComponent extends PureComponent {
  static propTypes = {
    map: PropTypes.object,
    layers: PropTypes.array
  };

  render() {
    const { map, layers } = this.props;

    return (
      <LayerManager
        map={map}
        plugin={PluginMapboxGl}
        providers={{
          countries: (layerModel, layer, resolve, reject) => {
            const { source } = layerModel;
            const { provider } = source;

            fetch('get', provider.url, provider.options, layerModel)
              .then(({ data }) => {
                return resolve({
                  ...layer,
                  source: {
                    ...omit(layer.source, 'provider'),
                    data: data.attributes.geojson
                  }
                });
              })
              .catch(e => {
                reject(e);
              });
          },
          'aac-cog': (layerModel, layer, resolve, reject) => {
            const { source } = layerModel;
            const { provider } = source;

            fetch('get', provider.url, provider.options, layerModel)
              .then((data) => {
                const parsedData = {
                  ...data,
                  features: data.features.map(f => ({
                    ...f,
                    properties: {
                      ...f.properties,
                      num_con: slugify(f.properties.num_con, {
                        lower: true
                      })
                    }
                  }))
                };

                return resolve({
                  ...layer,
                  source: {
                    ...omit(layer.source, 'provider'),
                    data: parsedData
                  }
                });
              })
              .catch(e => {
                reject(e);
              });
          },
          'aac-cod': (layerModel, layer, resolve, reject) => {
            const { source } = layerModel;
            const { provider } = source;

            fetch('get', provider.url, provider.options, layerModel)
              .then((data) => {
                const parsedData = {
                  ...data,
                  features: data.features.map(f => ({
                    ...f,
                    properties: {
                      ...f.properties,
                      num_ccf: slugify(f.properties.num_ccf || '', {
                        lower: true
                      })
                    }
                  }))
                };

                return resolve({
                  ...layer,
                  source: {
                    ...omit(layer.source, 'provider'),
                    data: parsedData
                  }
                });
              })
              .catch(e => {
                reject(e);
              });
          },
          'aac-cmr': (layerModel, layer, resolve, reject) => {
            const { source } = layerModel;
            const { provider } = source;

            fetch('get', provider.url, provider.options, layerModel)
              .then((data) => {
                const parsedData = {
                  ...data,
                  features: data.features.map(f => ({
                    ...f,
                    properties: {
                      ...f.properties,
                      nom_ufe: slugify(f.properties.nom_ufe || '', {
                        lower: true
                      })
                    }
                  }))
                };

                return resolve({
                  ...layer,
                  source: {
                    ...omit(layer.source, 'provider'),
                    data: parsedData
                  }
                });
              })
              .catch(e => {
                reject(e);
              });
          }
        }}
      >
        {!!layers && layers.map((l) => {
          return (
            <Layer
              key={l.id}
              {...l}
            />
          )
        })}
      </LayerManager>
    );
  }
}

export default LayerManagerComponent;