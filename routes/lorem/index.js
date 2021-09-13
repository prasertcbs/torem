'use strict';

const fetch = require('node-fetch');
const q = require('../../models/lorem_data.js');
let wishes = {};

/**
 * read JSON data from url
 * @param {string} url
 * @returns {Object}
 */
async function readJson(url) {
  const response = await fetch(url);
  if (response.ok) {
    return response.json();
  } else {
    console.log('error');
  }
}

/**
 * random an integer number [min, max]
 * @param {number} min
 * @param {number} max
 * @returns {number} randomized integer number
 */
function randBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * sample (without replacement) ตัวเลข [min, max] จำนวน k ตัว
 * @param {number} min
 * @param {number} max
 * @param {number} k จำนวนครั้ง
 * @returns {Array} array ของตัวเลขที่ได้จากการสุ่ม
 */
function sampleBetween(min, max, k = 3) {
  const results = new Set();
  while (results.size !== k) {
    results.add(randBetween(min, max));
  }
  return Array.from(results);
}

/**
 * random a quote
 * @param {string} wishes
 * @param {string} text_type
 * @returns {string} quote
 */
function randomWish(wishes, text_type = 'meaning') {
  return wishes[text_type][randBetween(0, wishes[text_type].length - 1)];
}

function generateLorem(paragraphs = 3, sentences = 15, text_key = 'meaning') {
  // text_key = [meaning|bali|pronunciation]
  let lorem = '';
  for (let p = 1; p <= paragraphs; p++) {
    for (let s = 1; s <= sentences; s++) {
      let txt = randomWish(wishes, text_key);
      // console.log(txt);
      lorem += txt + ' ';
      
    }
    lorem += '\n';
  }
  return lorem;
}

async function readWishes() {
  wishes = q.wishes; // read from local (data/quotes_data.js)

  // adapted from: https://github.com/itriplek/birthday-quotes-with-text_typeships/blob/master/birthday-quotes-with-text_typeship-formatted.json
  // quotes = await readJson('https://raw.githubusercontent.com/prasertcbs/basic-dataset/master/birthday_quotes.json');

  // console.log(quotes['wife']);
  // console.log(Object.keys(quotes));
  // for (let i = 0; i < 5; i++) {
  //   console.log(randomQuote(quotes, 'wife'));
  // }
  console.log(new Date());
}

readWishes();

module.exports = async function (fastify, opts) {
  // http://127.0.0.1:5000/lorem
  fastify.get('/', async function (request, reply) {
    // return 'random birthday quote';
    // return quotes
    let text_types = Object.keys(wishes);
    let text_type = text_types[randBetween(0, text_types.length - 1)];
    return generateLorem();
    // return { text_type: text_type, quote: randomWish(wishes, text_type) };
  });
  
  fastify.get('/:text_type', async function (request, reply) {
    // http://127.0.0.1:5000/lorem/meaning?p=3&s=10
    // http://127.0.0.1:5000/lorem/bali?p=3&s=10
    // http://127.0.0.1:5000/lorem/pronunciation?p=3&s=10
    // console.log(request.params.text_type);
    // console.log(request.query.p);
    // console.log(request.query.s);
    let text_type = request.params.text_type;
    let paragraphs = 3;
    if (request.query.p) {
      paragraphs = +request.query.p;
    }
    let sentences = 15;
    if (request.query.s) {
      sentences = +request.query.s;
    }
    console.log(paragraphs, sentences, text_type);

    return generateLorem(paragraphs, sentences, text_type);
  });
};
