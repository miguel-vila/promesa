'use strict';

const Promesa = function() {
  this.listeners = [];
  this.value = undefined;

  const self = this;

  this.then = function (success, _catch) {
    let promesa = new Promesa();

    const completeUsing = function (f, value) {
      try {
        let result = f( value );
        if ( result === promesa ) {
          promesa.reject(new TypeError());
        } else if(result instanceof Promesa) {
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
    if(!self.value) {
      self.value = wrappedValue;

      self.listeners.forEach( listener => {
        setTimeout( () => listener(self.value) ); // Promises A/+ compliance
      });
      delete self.listeners;
    }
  }

  this.setValue = function(value, success) {
    self.completeWith({ success, value });
  };

  this.resolve = function(value) {
    if ( value === self) {
      self.reject(new TypeError());
    } else if(value instanceof Promesa) {
      self.completeWithPromise(value);
    } else {
      if(value && value.then) {
        if(typeof value.then === 'function') {
          try {
            value.then(self.resolve, self.reject);
          } catch (e) {
            if(!self.value) { // neither resolve nor reject were called
              self.reject(e);
            }
          }
        } else {
          self.setValue(value, true);
        }
      } else {
        self.setValue(value, true);
      }
    }
  };

  this.reject = function(error) {
    self.setValue(error, false);
  };

  this.onComplete = function (callback) {
    if(typeof self.value !== 'undefined') {
      //console.log('calling callback with', self.value);
      setTimeout(() => {
        callback(self.value);
      }); // Promises A/+ compliance
    } else {
      self.listeners.push(callback);
    }
  };



};

Promesa.prototype.String = function () {
  if(this.value) {
    return `Promesa(${this.value})`;
  } else {
    return `Promesa[Pending]`;
  }
};

module.exports = Promesa;
