'use strict'
var __extends =
  (this && this.__extends) ||
  (function() {
    var extendStatics = function(d, b) {
      extendStatics =
        Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array &&
          function(d, b) {
            d.__proto__ = b
          }) ||
        function(d, b) {
          for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]
        }
      return extendStatics(d, b)
    }
    return function(d, b) {
      extendStatics(d, b)
      function __() {
        this.constructor = d
      }
      d.prototype =
        b === null ? Object.create(b) : ((__.prototype = b.prototype), new __())
    }
  })()
var __importDefault =
  (this && this.__importDefault) ||
  function(mod) {
    return mod && mod.__esModule ? mod : { default: mod }
  }
Object.defineProperty(exports, '__esModule', { value: true })
var codemirror_1 = __importDefault(require('codemirror'))
var react_1 = __importDefault(require('react'))
var makeCodeMirrorChangeHandler_1 = __importDefault(
  require('../makeCodeMirrorChangeHandler')
)
var AutomergeCodeMirror = /** @class */ (function(_super) {
  __extends(AutomergeCodeMirror, _super)
  function AutomergeCodeMirror() {
    return (_super !== null && _super.apply(this, arguments)) || this
  }
  AutomergeCodeMirror.prototype.componentDidMount = function() {
    var _a = this.props,
      getAutomergeDoc = _a.getAutomergeDoc,
      setAutomergeDoc = _a.setAutomergeDoc,
      getText = _a.getText,
      links = _a.links,
      mutex = _a.mutex,
      editorConfiguration = _a.editorConfiguration
    var codeMirror = codemirror_1.default(
      this.codeMirrorDiv,
      editorConfiguration
    )
    codeMirror.setValue(getText(getAutomergeDoc()).join(''))
    var link = {
      codeMirror: codeMirror,
      getText: getText,
    }
    links.add(link)
    var changeHandler = makeCodeMirrorChangeHandler_1.default(
      getAutomergeDoc,
      getText,
      setAutomergeDoc,
      mutex
    )
    codeMirror.on('change', changeHandler)
    this.unmountCodeMirror = function() {
      links.delete(link)
      codeMirror.off('change', changeHandler)
    }
  }
  AutomergeCodeMirror.prototype.componentWillUnmount = function() {
    this.unmountCodeMirror()
  }
  AutomergeCodeMirror.prototype.render = function() {
    var _this = this
    var ref = function(div) {
      _this.codeMirrorDiv = div
    }
    return react_1.default.createElement('div', {
      itemProp: 'editor',
      itemType: 'https://subsecondtdd.org/CodeMirror',
      ref: ref,
    })
  }
  return AutomergeCodeMirror
})(react_1.default.PureComponent)
exports.default = AutomergeCodeMirror
//# sourceMappingURL=AutomergeCodeMirror.js.map
