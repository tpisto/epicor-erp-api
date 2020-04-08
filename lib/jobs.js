const ServiceBase = require('./serviceBase');
const R = require('ramda');

const SERVICE = 'Erp.Bo.JobEntrySvc';

class Jobs extends ServiceBase {
  constructor(connection) {
    super(connection, SERVICE, 'JobHead', 'JobNum');
  }

  list(where, fields, options = {}) {
    return super.list(where, fields, {...options, listMethod: 'JobEntries'});
  }

  setOperValue(ds, lineNum, name, value) {
    ds.JobOper[lineNum][name] = value;
  }

  setOperDtlValue(ds, lineNum, name, value) {
    ds.JobOpDtl[lineNum][name] = value;
  }

  /**
   * Create a job.
   * This will call GetNextJobNum to fetch the next available job number.
   */
  async create(record) {
    if (!record.JobNum) {
      const {
        parameters: {opNextJobNum}
      } = await this.makeRequest('GetNextJobNum', {});
      record.JobNum = opNextJobNum;
    }
    const result = await super.create(R.omit(['JobProd'], record));
    if (record.JobProd) {
      result.JobProd = await this.addJobProds(record.JobNum, record.JobProd);
    }
    return result;
  }

  async addJobOper(jobNum, record) {
    const {
      parameters: {ds}
    } = await this.makeRequest('GetNewJobOper', {
      ds: {},
      jobNum,
      assemblySeq: 0
    });
    const newDetail = (await this.makeRequest('Update', {
      ds: {
        JobOper: [
          {
            ...ds.JobOper[0],
            ...record,
            RowMod: 'A'
          }
        ]
      }
    })).parameters.ds.JobOper[0];
    return newDetail;
  }

  async addJobOperByDs(ds, lineNum) {
    this.setOperValue(ds, lineNum, 'RowMod', 'A');
    // console.log('ds', ds);
    return (await this.makeRequest('Update', {
      ds: ds
    })).parameters.ds;
  }

  async getNewJobOper(ds, jobNum, assemblySeq) {
    return (await this.makeRequest('GetNewJobOper', {
      ds: ds,
      jobNum: jobNum,
      assemblySeq: assemblySeq
    })).parameters.ds;
  }

  async getNewJobOpDtl(ds, jobNum, assemblySeq, oprSeq) {
    return (await this.makeRequest('GetNewJobOpDtl', {
      ds: ds,
      jobNum: jobNum,
      assemblySeq: assemblySeq,
      oprSeq: oprSeq
    })).parameters.ds;
  }

  async getNewJobMtl(ds, jobNum, assemblySeq) {
    return (await this.makeRequest('GetNewJobMtl', {
      ds: ds,
      jobNum: jobNum,
      assemblySeq: assemblySeq
    })).parameters.ds;
  }

  async changeJobOperOpCode(ds, ProposedOpCode) {
    return (await this.makeRequest('ChangeJobOperOpCode', {
      ds: ds,
      ProposedOpCode: ProposedOpCode
    })).parameters.ds;
  }

  async changeJobMtlQtyPer(ds) {
    return (await this.makeRequest('ChangeJobMtlQtyPer', {
      ds: ds
    })).parameters.ds;
  }

  async changeJobMtlEstSplitCosts(ds) {
    return (await this.makeRequest('ChangeJobMtlEstSplitCosts', {
      ds: ds
    })).parameters.ds;
  }

  async changeJobMtlPartNum(ds, ipPartNum) {
    return (await this.makeRequest('ChangeJobMtlPartNum', {
      ds: ds,
      ipValidatePart: true,
      ipPartNum: ipPartNum,
      SysRowID: '00000000-0000-0000-0000-000000000000',
      xrefPartNum: '',
      xrefPartType: '',
      vMsgText: '',
      vSubAvail: false,
      vMsgType: '',
      multipleMatch: false,
      opPartChgCompleted: false,
      opMtlIssuedAction: ''
    })).parameters.ds;
  }

  async updateJobOperDtl(jobNum, oprSeq, dtlSeq, record) {
    const queryField =
      this.idField[0].toLowerCase() + this.idField.substring(1);
    let jobOpDtl = await this.makeRequest('GetByID', {
      [queryField]: jobNum
    }).then(result => {
      return result.returnObj['JobOpDtl'][0];
    }, err => (err.statusCode === 404 ? null : Promise.reject(err)));
    const payload = {
      ...jobOpDtl,
      ...record,
      RowMod: 'U'
    };
    // delete payload['SysRevID']
    return this.makeRequest('Update', {
      ds: {
        ['JobOpDtl']: [payload]
      }
    }).then(this._getFromResponse);
  }

  async changeJobOpDtlResourceID(ds, lineNum, ProposedResourceID) {
    this.setOperDtlValue(ds, lineNum, 'RowMod', 'U');
    return (await this.makeRequest('ChangeJobOpDtlResourceID', {
      ds: ds,
      ProposedResourceID: ProposedResourceID
    })).parameters.ds;
  }

  async changeJobOpDtlResourceGrpID(ds, lineNum, ProposedResGrpID) {
    this.setOperDtlValue(ds, lineNum, 'RowMod', 'U');
    return (await this.makeRequest('ChangeJobOpDtlResourceGrpID', {
      ds: ds,
      ProposedResGrpID: ProposedResGrpID
    })).parameters.ds;
  }

  async updatePartialDs(ds, property) {
    // ds[property][0].RowMod = 'U';
    return (await this.makeRequest('Update', {
      ds: {
        [property]: ds[property]
      }
    })).parameters.ds;
  }

  async updateDs(ds) {
    return (await this.makeRequest('Update', {
      ds: ds
    })).parameters.ds;
  }

  // async changeJobOpDtlResourceId(jobNum, oprSeq, dtlSeq, record) {
  //   const queryField =
  //     this.idField[0].toLowerCase() + this.idField.substring(1);
  //   let jobOpDtl = await this.makeRequest('GetByID', {
  //     [queryField]: jobNum
  //   }).then(
  //     result => {
  //       return result.returnObj['JobOpDtl'][0];
  //     },
  //     err => (err.statusCode === 404 ? null : Promise.reject(err))
  //   );
  //   const ds = (
  //     await this.makeRequest('ChangeJobOpDtlResourceID', {
  //       ds: {
  //         JobOpDtl: [
  //           {
  //             ...jobOpDtl,
  //             ...record,
  //             RowMod: 'U'
  //           }
  //         ]
  //       },
  //       ProposedResourceID: record.ResourceID
  //     })
  //   ).parameters.ds;
  //   return (await this.makeRequest('Update', {ds})).parameters.ds.JobOpDtl[0];
  // }

  /**
   * Create job prod records.
   * Return array of created job prods.
   */
  async addJobProds(jobNum, jobProds) {
    const result = [];
    for (let jp of jobProds) {
      const {
        parameters: {ds}
      } = await this.makeRequest('GetNewJobProd', {
        ds: {},
        jobNum,
        partNum: jp.PartNum,
        orderNum: jp.OrderNum,
        orderLine: jp.OrderLine,
        orderRelNum: jp.OrderRelNum,
        warehouseCode: jp.WarehouseCode || '',
        targetJobNum: jp.TargetJobNum || '',
        targetAssemblySeq: jp.TargetAssemblySeq || 0
      });
      const newDetail = (await this.makeRequest('Update', {
        ds: {
          JobProd: [
            {
              ...ds.JobProd[0],
              RowMod: 'A'
            }
          ]
        }
      })).parameters.ds.JobProd[0];
      result.push(newDetail);
    }
  }

  async setEngineered(jobDs, isEngineered) {
    jobDs.JobHead[0].JobEngineered = isEngineered;
    jobDs.JobHead[0].RowMod = 'U';
    jobDs.JobHead[0].ChangeDescription = 'Maplet update - set engineered';
    const ds = (await this.makeRequest('ChangeJobHeadJobEngineered', {
      ds: jobDs
    })).parameters.ds;
    return (await this.makeRequest('Update', {ds})).parameters.ds;
  }

  async setReleased(jobDs, isReleased) {
    jobDs.JobHead[0].JobReleased = isReleased;
    jobDs.JobHead[0].RowMod = 'U';
    jobDs.JobHead[0].ChangeDescription = 'Maplet update - set released';
    const ds = (await this.makeRequest('ChangeJobHeadJobReleased', {ds: jobDs}))
      .parameters.ds;
    return (await this.makeRequest('Update', {ds})).parameters.ds;
  }

  async getDetails(record) {
    return (await this.makeRequest('GetDetails', {
      currJobNum: record.currJobNum,
      currAsmSeq: record.currAsmSeq,
      sourceFile: record.sourceFile || '',
      sourceQuote: record.sourceQuote || 0,
      sourceLine: record.sourceLine || 0,
      sourceJob: record.sourceJob || '',
      sourceAsm: record.sourceAsm || 0,
      sourcePart: record.sourcePart || '',
      sourceRev: record.sourceRev || '',
      sourceAltMethod: record.sourceAltMethod || '',
      resequence: record.resequence || true,
      useMethodForParts: record.useMethodForParts || false,
      getCostsFromInv: record.getCostsFromInv || false,
      getCostsFromTemp: record.getCostsFromTemp || false
    })).returnObj;
  }
}

module.exports = Jobs;
