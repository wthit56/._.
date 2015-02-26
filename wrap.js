var wrap = module.exports = (function() {
  var find = /^([^\.#]+)(#[^\.#]+)?((?:\.[^\.#]+)+)?$/;
  var dots = /\./g;
  var pre, post;
  var i, l;
  
  return function wrap(selector, content) {
    var found = selector.match(find);
    if (found) {
      pre = (
        "<" + found[1] +
          (found[2]
            ? " id=\"" + found[2].substring(1) + "\""
            : "") +
          (found[3]
            ? " class=\"" + found[3].substring(1).replace(dots, " ") + "\""
            : ""
          ) +
        ">"
      );
      post = "</" + found[1] + ">";
      
      if (Array.isArray(content)) {
        for (i = 0, l = content.length; i < l; i++) {
          content[i] = pre + content[i] + post;
        }
        pre = post = "";
        return content;
      }
      else {
        return pre + content + post;
      }
    }
    else {
      throw "Invalid selector: " + selector;
    }
  };
})();