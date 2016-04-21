'use strict';

const deferred = function () {
  let promesa = new Promesa();
  return {
    promise: promesa,
    resolve: promesa.resolve,
    reject:  promesa.reject
  };
};

const resolved = function (val) {
  let promesa = new Promesa();
  promesa.value = { value: val, success: true };
  return promesa;
};

const rejected = function (error) {
  let promesa = new Promesa();
  promesa.value = { value: error, success: false };
  return promesa;
}

const Promesa = function() {
  this.listeners = [];
  this.value = undefined;

  const self = this;

  this.then = function (success, _catch) {
    let promesa = new Promesa();

    const completeUsing = function (f, value) {
      try {
        let result = f( value );
        if(result instanceof Promesa) {
          promesa.completeWithPromise( result );
        } else {
          promesa.resolve( result );
        }
      } catch (error) {
        //console.log('exception thrown: ', error);
        promesa.reject( error );
      }
    };

    self.onComplete( valueObject => {
      if(valueObject.success) {
        if(typeof success === 'function') {
          completeUsing( success, valueObject.value );
        } else {
          promesa.completeWith( valueObject );
        }
      } else {
        if(typeof _catch === 'function') {
          completeUsing( _catch, valueObject.value );
        } else {
          promesa.completeWith( valueObject );
        }
      }
    });

    return promesa;
  };

  this.map = function(f) {
    let promesa = new Promesa();
    self.onComplete( valueObject => {

      if(valueObject.success) {
        try {
          promesa.resolve(f(valueObject.value));
        } catch (error) {
          promesa.reject(error);
        }
      } else {
        promesa.reject(valueObject.value);
      }
    });
    return promesa;
  };

  this.flatMap = function(ff) {
    let promesa = new Promesa();

    self.onSuccess( valueObjectA => {
      if(valueObjectA.success) {
        let nuevaPromesa = ff(valueObjectA.value);
        promesa.completeWithPromise( nuevaPromesa );
      } else {
        promesa.reject(valueObjectA.value);
      }
    });

    return promesa;
  };

  this.completeWithPromise = function(otherPromise) {
    otherPromise.onComplete(self.completeWith);
  };

  this.completeWith = function(wrappedValue) {
    self.value = wrappedValue;

    self.listeners.forEach( listener => listener(self.value) );
    delete self.listeners;
  }

  this.setValue = function(value, success) {
    self.completeWith({ success, value });
  };

  this.resolve = function(value) {
    self.setValue(value, true);
  };

  this.reject = function(error) {
    self.setValue(error, false);
  };

  this.onComplete = function (callback) {
    if(typeof self.value !== 'undefined') {
      //console.log('calling callback with', self.value);
      callback(self.value);
    } else {
      self.listeners.push(callback);
    }
  };

};

module.exports = {
  resolved,
  rejected,
  deferred
};
