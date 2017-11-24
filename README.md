cep-finder
=========

Easy CEP (brazilian postal code) finder.

## Installation
`npm install cep-finder`  

## Usage
ES6 modules

```js
import cepFinder from "cep-finder";
```
or CommonJS
```js
const cepFinder = require("cep-finder");
```

```js 
cepFinder("01311300").then(result => console.log(result));
```

will produce the following JSON:
```json
{
    logradouro: 'Avenida Paulista',
    complemento: 'de 1867 ao fim - lado ímpar',
    bairro: 'Bela Vista',
    cidade: 'São Paulo',
    estado: 'SP',
    cep: '01311-300'
}
```

__nodeJS:__

When running in node by default the [Correios](http://www.buscacep.correios.com.br/sistemas/buscacep/resultadoBuscaCepEndereco.cfm) page will be used.
it is also possible use [ViaCEP](https://viacep.com.br/) providing __"webservice"__ as a second parameter:
```js
cepFinder("01311300", "webservice").then(result => console.log(result));
```
__browser:__

To avoid CORS problems, ViaCEP is always used.

## Tests

  `npm test`
  
