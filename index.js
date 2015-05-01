var mongoose = require("mongoose");
var SchemaTypes = mongoose.SchemaTypes;
var Schema = mongoose.Schema;
function Nested (path, options) {
  // console.log("Nested",arguments)
  var required = options.required;
  var type = options.type;
  delete options.required;
  delete options.type;
  var topPath = path;
  SchemaTypes.Mixed.call(this, path, options);
  function validateChildren (arg, cb) {
    // console.log("validateChildren",path,arguments)
    if (!required && !arg) {
      return cb(true);
    } else if (require && !arg) {
      return cb(false);
    }
    // console.log("validateChildren",!required, !arg,arguments)
    var self = this;
    var schema = new Schema(options, {
      _id : false
    });

    var validating = {};
    var total = 0;
    var completed = false;
    schema.eachPath(validatePath);
    if(total == 0) {
      complete();
    }
    var errors = [];
    function validatePath (path) {
      if (validating[path])
        return;
      // console.log("validatePath",arguments)

      validating[path] = true;
      if(path.indexOf(".")>-1)
        return;

      total++;

      process.nextTick(function () {
        // console.log("valud",val)
        var p = schema.path(path);
        if (!p || !p.validators.length)
          return --total || complete();
        var cPath = [ topPath, path ].join('.');
        var val = self.getValue(cPath);
        // console.log("pre-doValidate",self,val,path)
        p.doValidate(val, function (err) {
          // console.log("doValidate",arguments)
          if (err) {
            errors.push(err);
            self.invalidate(cPath, err, undefined, true // embedded docs
            );
          }
          if(--total==0){
            complete();
          }
        }, self);
      });
    }

    function complete () {
      if(!completed){
        completed=true;
        cb(true);
      }
    }
  }
  this.validate(validateChildren);
}
Nested.prototype.__proto__ = SchemaTypes.Mixed.prototype;
SchemaTypes.Nested = Nested;
mongoose.Types.Nested = Nested;// Mixed;
