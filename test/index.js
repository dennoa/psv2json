'use strict';

const psv2json = require('../index.js');
const latlong2coords = require('./latlong2coords');
const expect = require('chai').expect;
const fs = require('fs');

function createJson(psv, options) {
  return new Promise((resolve, reject)=> {
    let json = psv.substring(0, psv.length - 4) + '.json';
    let psvStream = fs.createReadStream(psv, { encoding: 'utf8' });
    let jsonStream = fs.createWriteStream(json);
    psvStream.pipe(psv2json(options)).pipe(jsonStream)
      .on('close', resolve)
      .on('error', reject);
  });
}

describe('psv2json', function() {

  it('should transform psv to json', function(done) {
    let psv = __dirname + '/data/Authority_Code_LOCALITY_CLASS_AUT_psv.psv';
    createJson(psv).then(()=> {
      fs.readFile(__dirname + '/data/Authority_Code_LOCALITY_CLASS_AUT_psv.json', 'utf8', (err, text)=> {
        if (err) { return done(err); }
        let json = JSON.parse('[' + text + ']');
        expect(json[7].CODE).to.equal('V');
        expect(json[7].NAME).to.equal('UNOFFICIAL TOPOGRAPHIC FEATURE');
        expect(json[7].DESCRIPTION).to.equal('UNOFFICIAL TOPOGRAPHIC FEATURE');
        done();
      });
    })
  });

  it('should allow the header to be transformed by some function', function(done) {
    let options = { transformHeader: (header => header.toLowerCase()) };
    let psv = __dirname + '/data/Authority_Code_LEVEL_TYPE_AUT_psv.psv';
    createJson(psv, options).then(()=> {
      fs.readFile(__dirname + '/data/Authority_Code_LEVEL_TYPE_AUT_psv.json', 'utf8', (err, text)=> {
        if (err) { return done(err); }
        let json = JSON.parse('[' + text + ']');
        expect(json[3].code).to.equal('L');
        expect(json[3].name).to.equal('LEVEL');
        expect(json[3].description).to.equal('LEVEL');
        done();
      });
    })
  });

  it('should escape double quotes with a backslash', function(done) {
    let psv = __dirname + '/data/double_quote_test.psv';
    createJson(psv).then(()=> {
      fs.readFile(__dirname + '/data/double_quote_test.json', 'utf8', (err, text)=> {
        if (err) { return done(err); }
        let json = JSON.parse('[' + text + ']');
        expect(json[0].DESCRIPTION).to.equal('Arnie said "I\'ll be back"');
        done();
      });
    })
  });

  it('should allow each data row to be transformed by some function', function(done) {
    let options = { transformHeader: (header => header.toLowerCase()), transformJsonItem: latlong2coords };
    let psv = __dirname + '/data/OT_ADDRESS_DEFAULT_GEOCODE_psv.psv';
    createJson(psv, options).then(()=> {
      fs.readFile(__dirname + '/data/OT_ADDRESS_DEFAULT_GEOCODE_psv.json', 'utf8', (err, text)=> {
        if (err) { return done(err); }
        let json = JSON.parse('[' + text + ']');
        expect(json[0].coordinates[0]).to.equal(105.68492893);
        expect(json[0].coordinates[1]).to.equal(-10.42542451);
        done();
      });
    })
  });

});
