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
}

module.exports = IssueReturn;
