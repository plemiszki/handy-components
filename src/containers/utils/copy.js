export const deepCopy = (obj) => {
    if (typeof obj == 'object') {
      if (Array.isArray(obj)) {
        var l = obj.length;
        var r = new Array(l);
        for (var i = 0; i < l; i++) {
          r[i] = deepCopy(obj[i]);
        }
        return r;
      } else {
        var r = {};
        r.prototype = obj.prototype;
        for (var k in obj) {
          r[k] = deepCopy(obj[k]);
        }
        return r;
      }
    }
    return obj;
}
