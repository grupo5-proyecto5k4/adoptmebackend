exports.ahora = function(){ return new Date(Date.now()- (3*3600*1000)).toISOString()};
exports.resta = function(X){ return new Date(Date.now()- ((X+3)*3600*1000)).toISOString()};
exports.sumar = function(X){ return new Date(Date.now()- ((3-X)*3600*1000)).toISOString()};
exports.redondear = function(X){ if(X > 0 && X < 1 ) X = 1;  return X};
