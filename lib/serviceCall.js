const ServiceBase = require('./serviceBase');

const SERVICE = 'Erp.BO.ServiceCallCenterSvc';

class ServiceCall extends ServiceBase {
  constructor(connection) {
    super(connection, SERVICE, 'FSCallhd', 'CallNum');
  }

  setDtValue(ds, lineNum, name, value) {
    ds.FSCallDt[lineNum][name] = value;
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

  async addCallDetailsByDs(ds, lineNum) {
    this.setDtValue(ds, lineNum, 'RowMod', 'A');
    const newDetail = (await this.makeRequest('Update', {
      ds: ds,
      opMessage: null
    })).parameters.ds;
    return newDetail;
  }

  async createJob(ds, ipCallNum, ipCallLine) {
    // let index = ds.FSCallDt.findIndex(v => v.CallLine == ipCallLine);
    // this.setDtValue(ds, index, 'RowMod', 'U');
    const newServiceCall = (await this.makeRequest('CreateServiceCallJob', {
      ds: ds,
      ipCallNum,
      ipCallLine
    })).parameters.ds;
    return newServiceCall;
  }

  async getNewFSCallDt(ds, callNum) {
    const serviceCallDt = (await this.makeRequest('GetNewFSCallDt', {
      ds: ds,
      callNum: callNum
    })).parameters.ds;
    return serviceCallDt;
  }

  async changeDtlPartNum(ds, uomCode) {
    const serviceCallDt = (await this.makeRequest('ChangeDtlPartNum', {
      ds: ds,
      uomCode: uomCode
    })).parameters.ds;
    return serviceCallDt;
  }

  async changeHdrCustID(ds, ipCustID) {
    const serviceCall = (await this.makeRequest('ChangeHdrCustID', {
      ds: ds,
      ipCustID
    })).parameters.ds;
    return serviceCall;
  }

  async changeHdrCallCode(ds, ipCallCode) {
    const serviceCall = (await this.makeRequest('ChangeHdrCallCode', {
      ds: ds,
      ipCallCode
    })).parameters.ds;
    return serviceCall;
  }
}

module.exports = ServiceCall;
