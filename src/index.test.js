'use strict';

var expect = require('chai').expect;
const cepFinder = require('./index');

describe('CepFinder', function () {
  this.timeout(5000);
  it('should return a valid address object', function (done) {
    const expectedObject = {
      logradouro: 'Rua 15 de Novembro',
      bairro: 'Centro',
      cidade: 'Blumenau',
      estado: 'SC',
      cep: '89010-000',
      complemento: 'até 900 - lado par'
    };


    cepFinder("89010000").then(result => {
      console.log(result);
      expect(result).to.deep.equal(expectedObject);
      done();
    });

  });
  it('should return a valid address object using webservice', function (done) {
    const expectedObject = {
      logradouro: 'Avenida Paulista',
      bairro: 'Bela Vista',
      cidade: 'São Paulo',
      estado: 'SP',
      cep: '01311-300',
      complemento: "de 1867 ao fim - lado ímpar"
    };


    cepFinder("01311300", "webservice").then(result => {
      expect(result).to.deep.equal(expectedObject);
      done();
    });

  });
  it('should not find CEP', function (done) {
    const cep = 98312802;
    const expected = {message: `CEP ${cep} não encontrado.`};
    cepFinder(cep).then(result => {
      expect(result.message).to.deep.equal(expected.message);
      done();
    });
  });

  it('should return an invalid CEP', (done) => {
    const cep = 123456789;
    const expected = {message: `CEP ${cep} inválido.`};
    cepFinder(cep).then(result => {
      expect(result.message).to.deep.equal(expected.message);
      done();
    });
  });
});
