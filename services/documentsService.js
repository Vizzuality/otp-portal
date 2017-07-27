import 'isomorphic-fetch';
import { post, remove } from 'utils/request';

export default class DocumentsService {

  constructor(options = {}) {
    this.opts = options;
  }

  saveDocument({ type, body }) {
    return new Promise((resolve, reject) => {
      post({
        url: `${process.env.OTP_API}/documents`,
        type,
        body,
        headers: [{
          key: 'Content-Type',
          value: 'application/vnd.api+json' // application/vnd.api+json
        }, {
          key: 'Authorization',
          value: `Bearer ${this.opts.authorization}`
        }, {
          key: 'OTP-API-KEY',
          value: process.env.OTP_API_KEY
        }],
        onSuccess: (response) => {
          resolve(response);
        },
        onError: (error) => {
          reject(error);
        }
      });
    });
  }

  deleteDocument(id) {
    return new Promise((resolve, reject) => {
      remove({
        url: `${process.env.OTP_API}/documents/${id}`,
        headers: [{
          key: 'Content-Type',
          value: 'application/json'
        }, {
          key: 'Authorization',
          value: `Bearer ${this.opts.authorization}`
        }, {
          key: 'OTP-API-KEY',
          value: process.env.OTP_API_KEY
        }],
        onSuccess: (response) => {
          resolve(response);
        },
        onError: (error) => {
          reject(error);
        }
      });
    });
  }
}
