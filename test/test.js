'use strict';

const Promesa = require('./promesa-adapter.js');

const assert = require('chai').assert;
const expect = require('chai').expect;
const should = require('chai').should();

describe('Promesa', () => {
  describe('test-basico', () => {

    it('test1', (done) => {
      let deferred = Promesa.deferred();
      setTimeout( () => deferred.resolve(3), 100 );
      deferred.promise
      .then( (x) => x*7 )
      .then( (x) => {
        x.should.equal(21);
        done();
      });
    })

    it('test2', (done) => {
      let deferred = Promesa.deferred();
      setTimeout( () => deferred.resolve(5), 100);
      deferred.promise
      .then( x => {
        if(x > 0) {
          throw new Error("ouch!");
        } else {
          return x*(-1);
        }
      })
      .then( x => {
        assert.fail(1,0,'This function should never be called!');
        done()
      }, (error) => {
        error.message.should.equal('ouch!');
        done();
      });
    })

    it('test3', done => {
      let deferred = Promesa.deferred();
      setTimeout( () => deferred.resolve(5), 100);
      deferred.promise
      .then( x => {
        if(x > 0) {
          throw new Error("ouch!");
        } else {
          return x*(-1);
        }
      })
      .then(null, error => {
        if(error.message === 'ouch!') {
          return 100;
        } else {
          throw error;
        }
      })
      .then( x => {
        x.should.equal(100);
        done();
      }, _ => {
        assert.fail(1,0,'This function should never be called!');
        done()
      });
    })

  })
})
