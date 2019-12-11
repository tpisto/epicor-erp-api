const rp = require('request-promise-native');
const R = require('ramda');

class Connection {
  /**
   * Connection definition.
   * serverUrl: API base URL
   * username:
   * password:
   * company: optional company.  If this is specified then we'll pass that in call settings.
   */
  constructor({serverUrl, username, password, company, strictSSL}) {
    this.company = company;

    // Perform a request using a custom service method
    this.makeRequest = function(
      service,
      method,
      parameters = {},
      company = ''
    ) {
      const headers = {};
      if (company) headers['CallSettings'] = '{"Company":"' + company + '"}';
      else if (this.company)
        headers['CallSettings'] = '{"Company":"' + this.company + '"}';

      // TODO some nicer error handling?
      // console.log(
      //   'POST',
      //   `${serverUrl}/api/v1/${service}/${method}`,
      //   JSON.stringify(parameters, null, 4)
      // );

      return rp({
        uri: `${serverUrl}/api/v1/${service}/${method}`,
        body: parameters,
        headers,
        method: 'POST',
        json: true,
        auth: {
          user: username,
          pass: password
        },
        strictSSL: strictSSL
        // does not work?
        // agentOptions: {
        //   ca: fs.readFileSync('./samples/cacert.pem')
        // }
      });
    };

    // Perform a GET request to an OData service method
    this.odata = function(service, path, parameters = {}) {
      const qs = R.pickBy(val => !!val, parameters);
      const headers = {};
      if (this.company)
        headers['CallSettings'] = '{"Company":"' + this.company + '"}';

      // console.log('GET', `${serverUrl}/api/v1/${service}/${path}`, qs);

      return rp(`${serverUrl}/api/v1/${service}/${path}`, {
        qs,
        qsStringifyOptions: {
          arrayFormat: 'repeat'
        },
        headers,
        method: 'GET',
        json: true,
        auth: {
          user: username,
          pass: password
        },
        strictSSL: strictSSL
      }).then(({value}) => value);
    };
  }
}

module.exports = Connection;
