const ServiceBase = require('./serviceBase');

const SERVICE = 'Erp.BO.ServiceCallCenterSvc';

class ServiceCall extends ServiceBase {
  constructor(connection) {
    super(connection, SERVICE, 'FSCallhd', 'CallNum');
  }

  async addCallDetails(callNum, callDetails) {
    const result = [];
    for (let cd of callDetails) {
      const {
        parameters: {ds}
      } = await this.makeRequest('GetNewFSCallDt', {
        ds: {},
        callNum
      });
      const newDetail = (await this.makeRequest('Update', {
        ds: {
          FSCallDt: [
            {
              ...ds.FSCallDt[0],
              ...cd,
              RowMod: 'A'
            }
          ]
        }
      })).parameters.ds.FSCallDt[0];
      result.push(newDetail);
    }
    return result;
  }
}

module.exports = ServiceCall;
