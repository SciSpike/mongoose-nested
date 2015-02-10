var mongoose = require("mongoose");
var SchemaTypes = mongoose.SchemaTypes;
var Schema = mongoose.Schema;
function Nested (path, options) {
  //console.log("Nested",arguments)
  var required = options.required;
  var type = options.type;
  delete options.required;
  delete options.type;
  var topPath = path;
  //console.log('topPath:', path);

  SchemaTypes.Mixed.call(this, path, options);
  function validateChildren (arg, cb) {
    //console.log("validateChildren: arguments: ",JSON.stringify(arguments, undefined, 2));
    //console.log("validateChildren: this:", JSON.stringify(this,null,2));
    if (!required && !arg) {
      return cb(true);
    } else if (require && !arg) {
      return cb(false);
    }
    var self = this; // 'this' can be the wrong 'this' & can cause validation errors!
    var schema = new Schema(options, {
      _id : false
    });

    var validating = {}, total = 0;
    var errors = [];

    function validatePath (path) {
      if (validating[path])
        return;
      //console.log("validatePath called with arguments: ",JSON.stringify(arguments, undefined, 2));
      //console.log("validating status: ", JSON.stringify(validating, null, 2));

      validating[path] = true;
      total++;

      //process.nextTick(function () {
        //console.log("nextTick function called with arguments: ",JSON.stringify(arguments, undefined, 2));
        var p = schema.path(path);
        if (!p)
          return --total || complete();
        //console.log("topPath is ", topPath);
        var cPath = [ topPath, path ].join('.');
        var val = self.getValue(cPath);
        if (p.validators.length > 0) {
          // WEIRD:  adding thiz:this to the stringified object below fixes the problem!!!
          console.log('!!!!! IGNORE THE FOLLOWING:  TypeError: Converting circular structure to JSON');
          JSON.stringify({thiz:this},null,2);
          //console.log("validating: ", JSON.stringify({cPath:cPath,val_shown_in_array:[val],p:p,self:self,thiz:this},null,2));
          p.doValidate(val, function (err) {
            if (err) {
              //console.log("validation FAILED: ", JSON.stringify({cPath:cPath,val_shown_in_array:[val],p:p,self:self},null,2));
              errors.push(err);
              self.invalidate(cPath, err, undefined, true // embedded docs
              );
            }
            //console.log("validation OK: ", JSON.stringify({cPath:cPath,val:val,p:p},null,2));
            if(--total==0){
              complete();
            }
          }, self);
        } else {
          if(--total==0){
            complete();
          }
        }
      //});
    }

    function complete () {
      cb(!errors.length);
    }

    schema.eachPath(validatePath);

  }
  this.validate(validateChildren);
}
Nested.prototype.__proto__ = SchemaTypes.Mixed.prototype;
SchemaTypes.Nested = Nested;
mongoose.Types.Nested = Nested;// Mixed;
