import {Autoblow} from '@xsense/autoblow-sdk';
const a = new Autoblow();
const methods = Object.getOwnPropertyNames(Object.getPrototypeOf(a)).filter(m => typeof a[m] === 'function' && !m.startsWith('_'));
console.log(JSON.stringify(methods, null, 2));
