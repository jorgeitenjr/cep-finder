const axios = require('axios');
const cheerio = require('cheerio');
const isNode = require('detect-node');
const qs = require('qs');

const defaultUrl = 'http://www.buscacep.correios.com.br/sistemas/buscacep/resultadoBuscaCepEndereco.cfm';
const postalCodeServiceUrl = postalCode => `https://viacep.com.br/ws/${postalCode}/json/`;

const search = ".tmptabela tr";
const subSearch = "td";
const splitCharCityState = "/";
const splitCharStreet = "-";
const pattern = "^\\d{5}-?\\d{3}$";
const regExp = new RegExp(pattern);
const cepNotFound = cep => {
  return {message: `CEP ${cep} não encontrado.`};
};
const invalidValid = cep => {
  return {message: `CEP ${cep} inválido.`};
};
const unableToFindCep = cep => {
  return {message: `Não foi possível buscar o CEP ${cep}`};
};

const map = {
  0: 'logradouro',
  1: 'bairro',
  2: 'cidade',
  3: 'cep',
  4: 'estado',
  5: 'complemento'
};

const cepKey = "relaxation";

const params = {
  "semelhante": "N",
  "tipoCEP": "ALL"
};

const handleHtmlData = data => {
  const result = {};
  data(search).children(subSearch).each((key, element) => {
    const rowValue = element.children[0].data;
    if (key == 0) {
      const values = rowValue.split(splitCharStreet);
      result[map[key]] = values[0].trim();
      if (values.length > 1) {
        values.shift();
        result[map[5]] = values.join(splitCharStreet).trim();
      }
    }
    else if (key == 2) {
      const values = rowValue.split(splitCharCityState);
      result[map[key]] = values[0];
      result[map[4]] = values[1];
    } else {
      result[map[key]] = rowValue.trim();
    }

  });
  return result;
};

const isAValidCep = cep => regExp.test(cep);


/**
 * Search for the address of a CEP (postal code)
 * @param {string} the postal code
 * @param {string} in browser it will aways use the "webservice" call,
 *  running on node, by default it will use Correios html page, if "webservice"
 *  informed it will use the ViaCEP service call.
 * @return {object} representing the address
 */
const getAddress = async (cep, type) =>
  isAValidCep(cep) ?
    isNode ?
      type == "webservice" ?
        await getAddressFromService(cep)
        : await getAddressHtml(cep)
      : await getAddressFromService(cep)
    : invalidValid(cep);


const getAddressHtml = cep => {
  return new Promise((resolve, reject) => {
    const cepToFind = {};
    cepToFind[cepKey] = cep;
    const authOptions = {
      responseType: 'arraybuffer'
    };
    axios.post(
      defaultUrl, qs.stringify(Object.assign(params, {"relaxation": cep})), authOptions).then((response) => {

        if (response.status == 200) {
          const arrayBuffer = new Buffer(response.data);
          const data = cheerio.load(arrayBuffer.toString("binary"));
          const handled = handleHtmlData(data);
          if (Object.keys(handled).length === 0) {
            resolve(cepNotFound(cep));
          }
          resolve(handled);
        } else {
          console.log(err); //eslint-disable-line no-console
          reject(unableToFindCep(cep));
        }
      });
  });
};

const getAddressFromService = cep => {
  return new Promise((resolve, reject) => {
    axios.get(postalCodeServiceUrl(cep)).then((response) => {
      const result = response.data;
      if (response.status != 200) {
        reject(unableToFindCep(cep));
      }
      if (result.erro) {
        resolve(cepNotFound(cep));
      }
      const handled = {};
      handled[map[0]] = result[map[0]];
      handled[map[1]] = result[map[1]];
      handled[map[2]] = result['localidade'];
      handled[map[3]] = result[map[3]];
      handled[map[4]] = result['uf'];
      handled[map[5]] = result[map[5]];
      resolve(handled);
    });
  });
};

module.exports = getAddress;
