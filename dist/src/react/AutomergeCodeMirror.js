'use strict'
var __importStar =
  (this && this.__importStar) ||
  function (mod) {
    if (mod && mod.__esModule) return mod
    var result = {}
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k]
    result['default'] = mod
    return result
  }
Object.defineProperty(exports, '__esModule', { value: true })
var react_1 = __importStar(require('react'))
var AutomergeCodeMirror = function (props) {
  var makeCodeMirror = props.makeCodeMirror,
    connectCodeMirror = props.connectCodeMirror,
    getDoc = props.getDoc,
    setDoc = props.setDoc,
    getText = props.getText
  var codeMirrorDiv
  react_1.useEffect(function () {
    var codeMirror = makeCodeMirror(codeMirrorDiv)
    return connectCodeMirror(codeMirror, getDoc, setDoc, getText)
  }, [])
  return react_1.default.createElement('div', {
    ref: function (div) {
      return (codeMirrorDiv = div)
    },
  })
}
exports.default = AutomergeCodeMirror
//# sourceMappingURL=AutomergeCodeMirror.js.map
