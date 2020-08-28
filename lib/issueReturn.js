const ServiceBase = require('./serviceBase');

const SERVICE = 'Erp.BO.IssueReturnSvc';

class IssueReturn extends ServiceBase {
  constructor(connection) {
    super(connection, SERVICE, 'IssueReturn');
  }

  async getNewJobAsmblMultiple(jobNum) {
    return (await this.makeRequest('GetNewJobAsmblMultiple', {
      ds: {
        SelectedJobAsmbl: [
          {
            Company: this.connection.company,
            JobNum: jobNum,
            AssemblySeq: 0,
            RowMod: 'A'
          }
        ]
      },
      pCallProcess: 'IssueMaterial',
      pcMtlQueueRowID: '00000000-0000-0000-0000-000000000000',
      pcTranType: 'STK-MTL',
      pcMessage: ''
    })).returnObj;
  }

  async onChangeToJobSeq(ds) {
    return (await this.makeRequest('OnChangeToJobSeq', {
      ds: ds,
      pCallProcess: 'IssueMaterial',
      pcMessage: ''
    })).parameters.ds;
  }

  async getUnissuedQty(ds) {
    return (await this.makeRequest('GetUnissuedQty', {
      ds: ds
    })).parameters.ds;
  }

  async onChangeTranQty(ds) {
    let pdTranQty = ds.IssueReturn[0].TranQty;
    return (await this.makeRequest('OnChangeTranQty', {
      ds: ds,
      pdTranQty: pdTranQty
    })).parameters.ds;
  }

  async prePerformMaterialMovement(ds) {
    return (await this.makeRequest('PrePerformMaterialMovement', {
      ds: ds,
      requiresUserInput: false
    })).parameters.ds;
  }

  async masterInventoryBinTests(ds) {
    return (await this.makeRequest('MasterInventoryBinTests', {
      ds: ds,
      plNegQtyAction: '',
      pcNeqQtyMessage: '',
      pcPCBinAction: '',
      pcPCBinMessage: '',
      pcOutBinAction: '',
      pcOutBinMessage: ''
    })).parameters.ds;
  }

  async performMaterialMovement(ds) {
    return (await this.makeRequest('PerformMaterialMovement', {
      ds: ds,
      plNegQtyAction: false,
      legalNumberMessage: '',
      partTranPKs: ''
    })).parameters.ds;
  }
}

module.exports = IssueReturn;
