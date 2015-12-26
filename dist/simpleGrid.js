var ControlType;
(function (ControlType) {
    ControlType[ControlType["ReadOnly"] = 0] = "ReadOnly";
    ControlType[ControlType["Text"] = 1] = "Text";
    ControlType[ControlType["CheckBox"] = 2] = "CheckBox";
    ControlType[ControlType["ComboBox"] = 3] = "ComboBox";
    ControlType[ControlType["Expander"] = 4] = "Expander";
})(ControlType || (ControlType = {}));
/// <reference path='./../typings/jquery/jquery.d.ts'/>
var GridContext = (function () {
    function GridContext(elem, backColor, foreColor) {
        var _this = this;
        this._parent = null;
        this._clickHandlers = [];
        this._dblClickHandlers = [];
        this._keyDownHandlers = [];
        this._canvas = document.createElement("canvas");
        this._canvas.tabIndex = 1;
        this._context = this._canvas.getContext('2d');
        this._parent = $(document.createElement("div"));
        this._parent.css("display", "inline-block");
        this._parent.css("position", "relative");
        this._parent.append(this._canvas);
        this._backColor = backColor;
        this._foreColor = foreColor;
        this._context.strokeStyle = foreColor;
        this._canvas.addEventListener("click", function (ev) { return _this.onClick(ev); }, false);
        this._canvas.addEventListener("dblclick", function (ev) { return _this.onDblClick(ev); }, false);
        this._canvas.addEventListener("keydown", function (ev) { return _this.onKeyDown(ev); }, false);
        elem.append(this._parent);
    }
    GridContext.prototype.getTextBox = function () {
        if (this._textBox)
            return this._textBox;
        this._textBox = $(document.createElement("input"));
        this._textBox.attr("type", "text");
        this._textBox.css("position", "absolute");
        return this._textBox;
    };
    GridContext.prototype.drawHorizontalLine = function (x, y, x1) {
        this._context.moveTo(x, y);
        this._context.lineTo(x1, y);
    };
    GridContext.prototype.drawVerticalLine = function (x, y, y1) {
        this._context.moveTo(x, y);
        this._context.lineTo(x, y1);
    };
    GridContext.prototype.startDrawing = function () {
        this._context.beginPath();
    };
    GridContext.prototype.finishDrawing = function () {
        this._context.stroke();
    };
    GridContext.prototype.setSize = function (w, h) {
        this._parent.css("height", h);
        this._parent.css("width", w);
        this._context.canvas.height = h;
        this._context.canvas.width = w;
        $(this._canvas).css("height", h);
        $(this._canvas).css("width", w);
    };
    GridContext.prototype.getValueWidth = function (value, font) {
        return (value == null) ? this.getTextWidth(" ", font) : this.getTextWidth(value, font);
    };
    GridContext.prototype.setFocus = function () {
        this._canvas.focus();
    };
    GridContext.prototype.appendElement = function (elem) {
        if (elem != null)
            this._context.canvas.parentElement.appendChild(elem.get(0));
    };
    GridContext.prototype.drawRect = function (l, t, w, h, color) {
        var oldStyle = this._context.strokeStyle;
        this._context.strokeStyle = color;
        this._context.strokeRect(l, t, w, h);
        this._context.strokeStyle = oldStyle;
    };
    GridContext.prototype.fillRect = function (l, t, w, h, color) {
        var oldStyle = this._context.fillStyle;
        this._context.fillStyle = color;
        this._context.fillRect(l, t, w, h);
        this._context.fillStyle = oldStyle;
    };
    GridContext.prototype.fillBackground = function () {
        this._context.fillStyle = this._backColor;
        this._context.fillRect(0, 0, this._context.canvas.width, this._context.canvas.height);
    };
    GridContext.prototype.getTextWidth = function (text, font) {
        var oldFont = this._context.font;
        this._context.font = font;
        var w = this._context.measureText(text).width;
        this._context.font = oldFont;
        return w;
    };
    GridContext.prototype.drawText = function (text, left, top, width, color, font, align, baseline) {
        if (align === void 0) { align = "left"; }
        if (baseline === void 0) { baseline = "middle"; }
        var oldFillStyle = this._context.fillStyle;
        var oldFont = this._context.font;
        var oldAlign = this._context.textAlign;
        var oldBaseline = this._context.textBaseline;
        this._context.fillStyle = color;
        this._context.font = font;
        this._context.textAlign = align;
        this._context.textBaseline = baseline;
        this._context.fillText(text, left, top, width);
        this._context.fillStyle = oldFillStyle;
        this._context.font = oldFont;
        this._context.textAlign = oldAlign;
        this._context.textBaseline = oldBaseline;
    };
    GridContext.prototype.click_bind = function (handler) { this._clickHandlers.push(handler); };
    GridContext.prototype.click_unbind = function (handler) { this._clickHandlers = _.without(this._clickHandlers, handler); };
    GridContext.prototype.dblClick_bind = function (handler) { this._dblClickHandlers.push(handler); };
    GridContext.prototype.dblClick_unbind = function (handler) { this._dblClickHandlers = _.without(this._dblClickHandlers, handler); };
    GridContext.prototype.keyDown_bind = function (handler) { this._keyDownHandlers.push(handler); };
    GridContext.prototype.keyDown_unbind = function (handler) { this._keyDownHandlers = _.without(this._keyDownHandlers, handler); };
    GridContext.prototype.adjustScrollPosition = function (left, top, width, height) {
        if (left < this._canvas.parentElement.scrollLeft)
            this._canvas.parentElement.scrollLeft = left;
        if (top < this._canvas.parentElement.scrollTop)
            this._canvas.parentElement.scrollTop = top;
        if (left + width >= this._canvas.parentElement.clientWidth + this._canvas.parentElement.scrollLeft)
            this._canvas.parentElement.scrollLeft = this._canvas.parentElement.scrollLeft + width;
        if (top + height >= this._canvas.parentElement.clientHeight + this._canvas.parentElement.scrollTop)
            this._canvas.parentElement.scrollTop = this._canvas.parentElement.scrollTop + height;
    };
    GridContext.prototype.onClick = function (event) { _.each(this._clickHandlers, function (handler) { return handler(event.layerX, event.layerY); }); };
    GridContext.prototype.onDblClick = function (event) { _.each(this._dblClickHandlers, function (handler) { return handler(event.layerX, event.layerY); }); };
    GridContext.prototype.onKeyDown = function (event) {
        {
            _.each(this._keyDownHandlers, function (handler) {
                if (handler(event.keyCode)) {
                    event.preventDefault();
                }
            });
        }
    };
    return GridContext;
})();
/// <reference path='../typings/jquery/jquery.d.ts'/>
/// <reference path='../typings/underscore/underscore.d.ts'/>
/// <reference path='./common.ts'/>
/// <reference path='./grid-context.ts'/>
var Cell = (function () {
    function Cell(options, context, row, col, wAdjuster, ctrlType) {
        var _this = this;
        if (ctrlType === void 0) { ctrlType = ControlType.ReadOnly; }
        this._inEditMode = false;
        this._active = false;
        this._col = -1;
        this._row = -1;
        this._ctrlType = ControlType.ReadOnly;
        this._elem = null;
        this._label = "";
        this._value = null;
        this._cbPadding = 5;
        this._height = 25;
        this._width = 10;
        this._valueChangedHandlers = [];
        this._adjustWidth = function (col) { return _this._width; };
        this._comboBoxItems = [];
        this._context = context;
        this._backColor = options.backColor;
        this._foreColor = options.foreColor;
        this._font = options.font;
        this.cellType = ctrlType;
        this._row = row;
        this._col = col;
        this._adjustWidth = wAdjuster;
    }
    Cell.prototype.createTextBox = function () {
        var _this = this;
        var elem = this._context.getTextBox();
        elem.on("keydown", function (e) {
            if (!_this._inEditMode)
                return;
            if (e.keyCode === 13) {
                if (_this._value == _this._elem.val()) {
                    _this.cancelEdit();
                    return;
                }
                _this._value = _this._elem.val();
                _this._elem.css("visibility", "hidden");
                _this._elem.get(0).onkeypress = null;
                _this._context.setFocus();
                _this._inEditMode = false;
                _this.finishEdit(_this._value);
            }
            else if (e.keyCode === 27)
                _this.cancelEdit();
        });
        return elem;
    };
    Cell.prototype.createCheckBox = function () {
        var _this = this;
        var elemHtml = document.createElement("input");
        var elem = $(elemHtml);
        elem.attr("type", "checkbox").css("checked");
        elem.get(0).addEventListener("click", function (e) {
            var old = elemHtml.hasAttribute("checked");
            if (old)
                elemHtml.removeAttribute("checked");
            else
                elemHtml.setAttribute("checked", "");
            _this.finishEdit(!old);
        }, false);
        return elem;
    };
    Cell.prototype.createComboBox = function () {
        var _this = this;
        var elem = $(document.createElement("select"));
        elem.on("change", function (e) { return _this.finishEdit(elem.val()); });
        elem.keydown(function (ev) {
            if (ev.keyCode == 27)
                _this.cancelEdit();
        });
        return elem;
    };
    Cell.prototype.createControlIntl = function (ctrlType) {
        switch (ctrlType) {
            case ControlType.CheckBox: return this.createCheckBox();
            case ControlType.Text: return this.createTextBox();
            case ControlType.ComboBox: return this.createComboBox();
        }
        return null;
    };
    Object.defineProperty(Cell.prototype, "adjustWidth", {
        get: function () { return this._adjustWidth; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Cell.prototype, "col", {
        get: function () { return this._col; },
        set: function (c) { this._col = c; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Cell.prototype, "row", {
        get: function () { return this._row; },
        set: function (r) { this._row = r; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Cell.prototype, "top", {
        get: function () { return this._top; },
        set: function (t) { this._top = t; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Cell.prototype, "left", {
        get: function () { return this._left; },
        set: function (l) { this._left = l; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Cell.prototype, "height", {
        get: function () { return this._height; },
        set: function (h) { this._height = h; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Cell.prototype, "width", {
        get: function () { return this._width; },
        set: function (w) { this._width = w; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Cell.prototype, "foreColor", {
        get: function () { return this._foreColor; },
        set: function (fc) { this._foreColor = fc; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Cell.prototype, "backColor", {
        get: function () { return this._backColor; },
        set: function (bc) { this._backColor = bc; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Cell.prototype, "font", {
        get: function () { return this._font; },
        set: function (f) { this._font = f; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Cell.prototype, "inEditMode", {
        get: function () { return this._inEditMode; },
        set: function (on) {
            this._inEditMode = on;
            this.refresh();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Cell.prototype, "active", {
        get: function () { return this._active; },
        set: function (active) {
            this._active = active;
            if (!active)
                this.cancelEdit();
            this.refresh();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Cell.prototype, "cellType", {
        set: function (ctrlType) {
            if (this._elem != null) {
                this._elem.remove();
                this._elem = null;
            }
            this._elem = this.createControlIntl(ctrlType);
            this._ctrlType = ctrlType;
            this._context.appendElement(this._elem);
            if (this._elem != null) {
                this._elem = this._elem.css("visibility", "hidden");
            }
            this._width = this._adjustWidth(this._col);
            this.refresh();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Cell.prototype, "label", {
        get: function () { return this._label; },
        set: function (lbl) {
            this._label = lbl;
            this._width = this._adjustWidth(this._col);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Cell.prototype, "value", {
        get: function () { return this._value; },
        set: function (value) {
            this._value = value;
            this._width = this._adjustWidth(this._col);
            this.refresh();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Cell.prototype, "element", {
        get: function () { return this._elem; },
        enumerable: true,
        configurable: true
    });
    Cell.prototype.addItems = function (items) {
        var _this = this;
        if (this._ctrlType != ControlType.ComboBox) {
            return this;
        }
        var self = this;
        _.each(items, function (item) {
            var opt = $(document.createElement('option'));
            opt.text(item);
            opt.val(item);
            self._elem.append(opt);
            _this._comboBoxItems.push(opt);
        });
        this._width = this._adjustWidth(this._col);
        this.refresh();
    };
    Cell.prototype.onEnterPressed = function () {
        switch (this._ctrlType) {
            case ControlType.CheckBox:
                this._elem.click();
                this._context.setFocus();
                break;
            case ControlType.ComboBox:
            case ControlType.Text:
                this._inEditMode = true;
                this._elem.focus();
                break;
        }
        this.show();
    };
    Object.defineProperty(Cell.prototype, "visible", {
        set: function (value) {
            if (this._elem != null) {
                this._elem.css("visibility", value ? "visible" : "hidden");
            }
            if (this._ctrlType == ControlType.Text && !this._inEditMode) {
                this._elem.css("visibility", "hidden");
            }
        },
        enumerable: true,
        configurable: true
    });
    Cell.prototype.show = function () {
        var _this = this;
        if (this._elem) {
            this._elem.
                css("display", "float").
                css("position", "absolute").
                css("color", this._foreColor).
                css("font", this._font).
                css("background-color", this._backColor).
                css("margin", 0);
            this._elem.css("height", this._height).css("width", this._width);
            this._elem.css("top", this._top).css("left", this._left);
        }
        var inEditMode = this._inEditMode;
        if (this._ctrlType == ControlType.CheckBox) {
            this._elem.css("top", this._top + ((this._height - this._elem.height()) / 2));
            this._elem.css("left", this._left + this._cbPadding);
            this.drawData(this._label, this._cbPadding + this._left + this._elem.width());
        }
        else if (this._ctrlType == ControlType.ComboBox) {
            if (inEditMode) {
                this._elem.css("visibility", "visible");
                this._elem.css("border", "0px");
                _.each(this._comboBoxItems, function (item) { return item.css("font", _this._font).css("color", _this._foreColor).css("background-color", _this._backColor); });
                _.each(this._comboBoxItems, function (item) { return item.prop('selected', false); });
                var item = _.find(this._comboBoxItems, function (item) { return item.val() == _this._value; });
                if (item)
                    item.prop('selected', true);
            }
            else if (this._value) {
                this._elem.css("visibility", "hidden");
                this.drawData(this._value.toString(), this._left);
            }
        }
        else if (this._ctrlType == ControlType.Text) {
            if (inEditMode) {
                this._elem.val(this._value);
                this._elem.css("visibility", "visible");
                this._elem.focus();
                this._elem.select();
            }
            else if (this._value) {
                this._elem.css("visibility", "hidden");
                this.drawData(this._value.toString(), this._left);
            }
        }
        else if (this._value) {
            this.drawData(this._value.toString(), this._left);
        }
    };
    Cell.prototype.finishEdit = function (val) {
        var _this = this;
        this._value = val;
        this._width = this._adjustWidth(this._col);
        _.each(this._valueChangedHandlers, function (cb) {
            try {
                cb(val, _this._row, _this._col);
            }
            catch (ex) {
                console.error(ex);
            }
        });
    };
    Cell.prototype.getWidth = function () {
        if (this._ctrlType == ControlType.CheckBox) {
            return this._context.getTextWidth(this._label, this._font) + this._elem.width() + this._cbPadding * 3;
        }
        var textWidth = this._context.getValueWidth(this._value, this._font);
        var addition = this._cbPadding * 2;
        return textWidth + addition;
    };
    Cell.prototype.valueChanged_bind = function (handler) {
        this._valueChangedHandlers.push(handler);
    };
    Cell.prototype.drawData = function (val, left) {
        while (this._context.getValueWidth(val, this._font) >= this._width) {
            val = val.substring(0, val.length - 2);
        }
        this._context.drawText(val, this._cbPadding + left, this._top + this._height / 2, this._width - this._cbPadding * 2, this._foreColor, this._font);
    };
    Cell.prototype.refresh = function () {
        this._context.fillRect(this._left + 0.5, this._top + 0.5, this._width - 1, this._height - 1, this._backColor);
        if (this._active)
            this._context.drawRect(this._left + 1, this._top + 1, this._width - 2, this._height - 2, this._foreColor);
        this.show();
    };
    Cell.prototype.cancelEdit = function () {
        if (!this._inEditMode)
            return;
        if (this._ctrlType == ControlType.Text || this._ctrlType == ControlType.ComboBox) {
            this._elem.css("visibility", "hidden");
            this._elem.get(0).onkeypress = null;
        }
        this._context.setFocus();
        this._inEditMode = false;
        this.refresh();
    };
    return Cell;
})();
/// <reference path='./../typings/underscore/underscore.d.ts'/>
/// <reference path='./cell-control.ts' />
/// <reference path='./grid-context.ts' />
var Row = (function () {
    function Row(options, rowNum, getCells) {
        this._minHeight = 10;
        this._height = 0;
        this._visible = true;
        this._group = null;
        this._rowNum = 0;
        this._minHeight = options.minHeight;
        this._rowNum = rowNum;
        this._getCells = getCells;
    }
    Object.defineProperty(Row.prototype, "visible", {
        get: function () { return this._visible; },
        set: function (value) {
            this._visible = value;
            var cells = this._getCells(this._rowNum);
            _.each(cells, function (c) { return c.visible = value; });
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Row.prototype, "height", {
        get: function () { return this._height; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Row.prototype, "rowNum", {
        get: function () { return this._rowNum; },
        enumerable: true,
        configurable: true
    });
    Row.prototype.getCells = function () { return this._getCells(this._rowNum); };
    Row.prototype.adjustHeight = function () {
        var height = this.getMaxActualHeight();
        var cells = this._getCells(this._rowNum);
        if (height !== this._height) {
            _.each(cells, function (cell) { return cell.height = height; });
            this._height = height;
        }
    };
    Row.prototype.addGroup = function (gr) { this._group = gr; };
    Row.prototype.getMaxActualHeight = function () {
        var _this = this;
        var cells = this._getCells(this._rowNum);
        return _.reduce(cells, function (m, cell) { return Math.max(m, _.isUndefined(cell) ? _this._minHeight : cell.height); }, this._minHeight);
    };
    Row.prototype.drawGroup = function (y) {
        if (this._group == null)
            return;
        this._group.render(y + 2, this._height - 4);
    };
    return Row;
})();
var RowsGroup = (function () {
    function RowsGroup(headRow, rows, collapsed, context, refresh) {
        var _this = this;
        this._headRow = headRow;
        this._headRow.addGroup(this);
        this._rows = rows;
        this._refresh = refresh;
        this._expander = RowsGroup.createExpander();
        context.appendElement(this._expander);
        this._expander.click(function () { return _this.collapse(!_this._collapsed); });
        this.collapse(collapsed);
    }
    RowsGroup.createExpander = function () {
        var elem = $(document.createElement("button"));
        return elem.css("display", "float").css("position", "absolute").css("top", 0).css("left", 0).css("margin", 0);
    };
    RowsGroup.prototype.collapse = function (collapse) {
        this._collapsed = collapse;
        _.each(this._rows, function (r) { return r.visible = !collapse; });
        if (this._collapsed)
            this._expander.text("+");
        else
            this._expander.text("-");
        this._refresh();
    };
    RowsGroup.prototype.render = function (top, height) {
        this._expander.css("top", top);
        this._expander.css("left", 0);
        this._expander.css("height", height);
        this._expander.css("width", height);
        this._expander.css("visibility", "visible");
        this._expander.css("padding", 0);
    };
    return RowsGroup;
})();
/// <reference path='./../typings/underscore/underscore.d.ts'/>
/// <reference path='./cell-control.ts' />
var Column = (function () {
    function Column(options, colNum, getCells) {
        this._width = 0;
        this._colNum = colNum;
        this._minWidth = options.minWidth;
        this._width = this._minWidth;
        this._getCells = getCells;
        this._adjustWith = (!options.adjustWidth) ? true : options.adjustWidth;
    }
    Object.defineProperty(Column.prototype, "colNum", {
        get: function () { return this._colNum; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Column.prototype, "width", {
        get: function () { return this._width; },
        enumerable: true,
        configurable: true
    });
    Column.prototype.getMaxActualWidth = function (cells) {
        var _this = this;
        var widths = _.map(cells, function (cell) { return (!cell) ? _this._minWidth : cell.getWidth(); });
        return _.reduce(widths, function (m, w) { return Math.max(m, w); }, this._minWidth);
    };
    Column.prototype.adjustWidth = function () {
        if (this._adjustWith) {
            var width = this.getMaxActualWidth(this._getCells(this._colNum));
            if (width !== this._width)
                this._width = width;
            return width;
        }
        else
            return this._minWidth;
    };
    Column.prototype.refreshWidth = function () {
        var cells = this._getCells(this._colNum);
        var width = this._adjustWith ? this.getMaxActualWidth(cells) : this._minWidth;
        _.each(cells, function (cell) { return cell.width = width; });
        this._width = width;
    };
    return Column;
})();
/// <reference path='./../typings/underscore/underscore.d.ts'/>
/// <reference path='./common.ts'/>
var GridDataSource = (function () {
    function GridDataSource(config) {
        this._data = [];
        this._dataChangedHandlers = [];
        this._columns = 0;
        this._rows = 0;
        this._headers = undefined;
        if (!config.columns) {
            if (config.data.length <= 0)
                return;
            this.createAccessor(config.data);
        }
        else {
            this._headers = _.map(config.columns, function (colConf) { return colConf.name; });
            this._columns = config.columns.length;
            this._rows = config.data.length;
            this._accessor = function (i, j) {
                var col = config.columns[j];
                var obj = config.data[i];
                return (_.has(obj, col.field)) ? _.property(col.field)(obj) : "";
            };
            this._dataSetter = function (data, i, j) {
                var col = config.columns[j];
                var obj = config.data[i];
                if (_.has(obj, col.field)) {
                    obj[col.field] = data;
                }
                ;
            };
            this._optionsData = _.map(config.columns, function (colConf) { return colConf.options; });
            this._ctrlTypeCapturer = function (i, j) {
                var col = config.columns[j];
                return col.type;
            };
        }
    }
    GridDataSource.prototype.createAccessor = function (data) {
        var _this = this;
        if (_.isArray(data[0])) {
            this._data = _.map(data, function (d) { return d; });
            this._rows = data.length;
            this._accessor = function (i, j) { return _this._data[i][j]; };
            this._dataSetter = function (d, i, j) { return _this._data[i][j] = d; };
            this._ctrlTypeCapturer = function (i, j) { return ControlType.Text; };
        }
        else if (_.isObject(data[0])) {
            this.getObjAccessor(data);
        }
        else {
            this._data = _.map(data, function (d) { return [d]; });
            this._rows = data.length;
            this._accessor = function (i, j) { return _this._data[i][0]; };
            this._dataSetter = function (d, i, j) { return _this._data[i][0] = d; };
            this._ctrlTypeCapturer = function (i, j) { return ControlType.Text; };
        }
    };
    GridDataSource.prototype.getObjAccessor = function (data) {
        var _this = this;
        this._headers = _.chain(data).map(function (d) { return _.keys(d); }).flatten().uniq().value();
        this._columns = this._headers.length;
        this._rows = data.length;
        this._accessor = function (i, j) {
            var k = _this._headers[j];
            var obj = data[i];
            return (_.has(obj, k)) ? _.property(k)(obj) : "";
        };
        this._dataSetter = function (d, i, j) {
            var k = _this._headers[j];
            var obj = data[i];
            if (_.has(obj, k)) {
                obj[k] = d;
            }
        };
        this._ctrlTypeCapturer = function (i, j) { return ControlType.ReadOnly; };
    };
    Object.defineProperty(GridDataSource.prototype, "rowsNumber", {
        get: function () { return this._rows; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GridDataSource.prototype, "columnsNumber", {
        get: function () {
            if (this._data && this._data.length > 0)
                return this._data[0].length;
            else
                return this._columns;
        },
        enumerable: true,
        configurable: true
    });
    GridDataSource.prototype.getData = function (i, j) {
        if (j === void 0) { j = 0; }
        return this._accessor(i, j);
    };
    GridDataSource.prototype.getCtrlType = function (i, j) {
        if (j === void 0) { j = 0; }
        return this._ctrlTypeCapturer(i, j);
    };
    GridDataSource.prototype.getOptionsData = function (i, j) {
        if (this._optionsData && this._optionsData[j]) {
            return this._optionsData[j];
        }
        else {
            return [];
        }
    };
    GridDataSource.prototype.updateData = function (val, i, j, context) {
        this._dataSetter(val, i, j);
        _.each(this._dataChangedHandlers, function (handler) { return handler(context, i, j); });
    };
    GridDataSource.prototype.getHeader = function (i) {
        if (this._headers)
            return this._headers[i];
        else
            return undefined;
    };
    GridDataSource.prototype.dataChanged_bind = function (handler) {
        this._dataChangedHandlers.push(handler);
    };
    GridDataSource.prototype.dataChanged_unbind = function (handler) {
        _.without(this._dataChangedHandlers, handler);
    };
    return GridDataSource;
})();
// / <reference path='../typings/underscore/underscore.d.ts'/>
/// <reference path='../typings/jquery/jquery.d.ts'/>
/// <reference path='./cell-control.ts' />
/// <reference path='./row.ts' />
/// <reference path='./column.ts' />
/// <reference path='./grid-context.ts' />
/// <reference path='./grid-data-source.ts' />
var Grid = (function () {
    function Grid(config, elem) {
        var _this = this;
        this._rows = [];
        this._cols = [];
        this._cells = [];
        this._rowGroups = [];
        this._activeCell = null;
        this._width = 0;
        this._height = 0;
        this._paintingSuspended = true;
        this._includeHeader = false;
        this._colsStartX = 20;
        this._rowsStartY = 10;
        this._config = config;
        this._context = new GridContext(elem, this._config.cellOptions.backColor, this._config.cellOptions.foreColor);
        this._context.click_bind(function (x, y) { return _this.onClick(x, y); });
        this._context.dblClick_bind(function (x, y) { return _this.onDblClick(x, y); });
        this._context.keyDown_bind(function (keyCode) { return _this.onKeyDown(keyCode); });
        var rows = !config.rowsNumber ? 1 : config.rowsNumber;
        var cols = !config.columnsNumber ? 1 : config.columnsNumber;
        this._headersRowNum = (typeof this._config.headerRow === 'undefined') ? -1 : this._config.headerRow;
        this._includeHeader = (typeof this._config.headerRow !== 'undefined');
        if (this._config.dataSource) {
            this._dataSource = this._config.dataSource;
            rows = this._dataSource.rowsNumber;
            cols = this._dataSource.columnsNumber;
            this._dataSource.dataChanged_bind(function (context, i, j) {
                if (context === _this)
                    return;
                _this._cells[i][j].value = _this._dataSource.getData(i, j);
            });
        }
        var headerCells = [];
        for (var i = 0; i < cols; i++) {
            var col = new Column(this._config.columnOptions, i, function (cn) { return _.map(_this._cells, function (row) { return row[cn]; }); });
            this._cols.push(col);
            if (!this._includeHeader)
                continue;
            var cell = new Cell(this._config.cellOptions, this._context, -1, i, function (colNum) {
                var w = _this._cols[colNum].adjustWidth();
                _this.refresh();
                return w;
            });
            headerCells.push(cell);
        }
        this._headerRow = new Row(this._config.rowOptions, -1, function (rowNum) { return headerCells; });
        for (var i = 0; i < rows; i++) {
            this._cells[i] = [];
            this._rows.push(new Row(this._config.rowOptions, i, function (rowNum) { return _this._cells[rowNum]; }));
            for (var j = 0; j < cols; j++) {
                var cell = new Cell(this._config.cellOptions, this._context, i, j, function (colNum) {
                    var w = _this._cols[colNum].adjustWidth();
                    _this.refresh();
                    return w;
                });
                if (this._dataSource) {
                    var cellType = this._dataSource.getCtrlType(i, j);
                    cell.cellType = cellType;
                    if (cellType == ControlType.ComboBox) {
                        cell.addItems(this._dataSource.getOptionsData(i, j));
                    }
                    cell.value = this._dataSource.getData(i, j);
                    cell.valueChanged_bind(function (val, row, col) { return _this.updateDataSource(val, row, col); });
                }
                this._cells[i][j] = cell;
            }
        }
        if (this._dataSource && this._includeHeader)
            _.each(this._headerRow.getCells(), function (cell, i) { return cell.value = _this._dataSource.getHeader(i); });
        this._paintingSuspended = false;
    }
    Grid.prototype.updateDataSource = function (val, row, col) {
        if (this._dataSource)
            this._dataSource.updateData(val, row, col, this);
    };
    Grid.prototype.suspendPainting = function (suspend) {
        if (!suspend && this._paintingSuspended) {
            this._paintingSuspended = suspend;
            this.render();
        }
        this._paintingSuspended = suspend;
    };
    Grid.prototype.setRowsGroup = function (headRow, num, collapsed) {
        var _this = this;
        var row = this._rows[headRow];
        if (!row) {
            console.error("Cannot create group for undefined row");
            return;
        }
        if (headRow + num >= this._rows.length) {
            console.error("Cannot create group for undefined rows");
            return;
        }
        var groupRows = [];
        for (var i = headRow + 1; i <= headRow + num; i++) {
            groupRows.push(this._rows[i]);
        }
        var group = new RowsGroup(row, groupRows, collapsed, this._context, function () { return _this.render(); });
        this._rowGroups.push(group);
    };
    Grid.prototype.collapseAll = function () {
        _.each(this._rowGroups, function (rg) { return rg.collapse(true); });
    };
    Grid.prototype.expandAll = function () {
        _.each(this._rowGroups, function (rg) { return rg.collapse(false); });
    };
    Grid.prototype.getCell = function (row, col) {
        return this._cells[row][col];
    };
    Grid.prototype.refresh = function () {
        this.render();
    };
    Grid.prototype.calculateHeight = function () {
        var headersRowHeight = this._includeHeader ? this._headerRow.height : 0;
        _.each(this._rows, function (r) { return r.adjustHeight(); });
        if (this._rows.length == 0)
            return this._rowsStartY + headersRowHeight;
        var visibleRows = _.filter(this._rows, function (row) { return row.visible; });
        return _.reduce(visibleRows, function (total, row) { return (row.height + total); }, this._rowsStartY) + headersRowHeight;
    };
    Grid.prototype.calculateWidth = function () {
        _.each(this._cols, function (col) { return col.adjustWidth(); });
        if (this._cols.length > 0)
            return _.reduce(this._cols, function (total, col) { return col.width + total; }, this._colsStartX);
        else
            return this._colsStartX;
    };
    Grid.prototype.getColNumByX = function (x) {
        if (x < this._colsStartX)
            return -1;
        var i = 0;
        var currLeft = this._colsStartX;
        while (i < this._cols.length && currLeft <= x)
            currLeft += this._cols[i++].width;
        return i - 1;
    };
    Grid.prototype.getRowByY = function (y) {
        if (y < this._rowsStartY)
            return null;
        var i = 0;
        var currTop = this._rowsStartY;
        while (i < this._rows.length && currTop <= y) {
            if (this._headersRowNum == i) {
                if (y >= currTop && y < currTop + this._headerRow.height)
                    return this._headerRow;
                currTop += this._headerRow.height;
            }
            if (this._rows[i].visible)
                currTop += this._rows[i].height;
            i++;
        }
        if (this._rows.length > i - 1)
            return this._rows[i - 1];
        return null;
    };
    Grid.prototype.changeActiveCell = function (newActive) {
        if (!newActive)
            return;
        if (this._activeCell != null)
            this._activeCell.active = false;
        newActive.active = true;
        this._activeCell = newActive;
        this._context.adjustScrollPosition(this._activeCell.left, this._activeCell.top, this._activeCell.width, this._activeCell.height);
    };
    Grid.prototype.onClick = function (x, y) {
        var row = this.getRowByY(y);
        var col = this.getColNumByX(x);
        if (row == null)
            return;
        var rowCells = row.getCells();
        if (col < 0 || col >= rowCells.length)
            return;
        this.changeActiveCell(rowCells[col]);
    };
    Grid.prototype.onDblClick = function (x, y) {
        var row = this.getRowByY(y);
        var colNum = this.getColNumByX(x);
        if (row == null || colNum < 0)
            return;
        if (this._activeCell == null || this._activeCell.row != row.rowNum || this._activeCell.col != colNum)
            this.onClick(x, y);
        this._activeCell.inEditMode = true;
    };
    Grid.prototype.onKeyDown = function (keyCode) {
        if (!this._activeCell) {
            this.changeActiveCell(this._cells[0][0]);
            return false;
        }
        var rowNum = this._activeCell.row;
        var colNum = this._activeCell.col;
        if (rowNum < 0 || colNum < 0)
            return false;
        switch (keyCode) {
            case 37:
                if (this._activeCell.inEditMode)
                    return false;
                this.changeActiveCell(this._cells[rowNum][colNum - 1]);
                return true;
            case 39:
                if (this._activeCell.inEditMode)
                    return false;
                this.changeActiveCell(this._cells[rowNum][colNum + 1]);
                return true;
            case 38:
                if (this._activeCell.inEditMode)
                    return false;
                do {
                    rowNum = rowNum - 1;
                    if (!this._rows[rowNum])
                        return true;
                } while (!this._rows[rowNum].visible);
                this.changeActiveCell(this._cells[rowNum][colNum]);
                return true;
            case 40:
                if (this._activeCell.inEditMode)
                    return false;
                do {
                    rowNum = rowNum + 1;
                    if (!this._rows[rowNum])
                        return true;
                } while (!this._rows[rowNum].visible);
                this.changeActiveCell(this._cells[rowNum][colNum]);
                return true;
            case 13:
                this._activeCell.onEnterPressed();
                return true;
            case 27:
                if (this._activeCell.inEditMode)
                    this._activeCell.cancelEdit();
                return false;
            default:
                if (!this._activeCell.inEditMode)
                    this._activeCell.inEditMode = true;
                return false;
        }
    };
    Grid.prototype.render = function () {
        var _this = this;
        if (this._paintingSuspended)
            return;
        _.each(this._cols, function (col) { return col.refreshWidth(); });
        _.each(this._rows, function (row) { return row.adjustHeight(); });
        this._headerRow.adjustHeight();
        this.resize();
        this._context.startDrawing();
        this._context.fillBackground();
        var headerCells = this._headerRow.getCells();
        if (this._cols.length > 0) {
            var colNum = 0;
            var x = 0.5 + this._colsStartX;
            _.each(this._cols, function (col) {
                _this._context.drawVerticalLine(x, _this._rowsStartY, _this._height);
                if (colNum < _this._cols.length) {
                    for (var i = 0; i < _this._rows.length; i++)
                        _this._cells[i][colNum].left = x;
                    if (_this._includeHeader)
                        headerCells[colNum].left = x;
                    x += col.width;
                    colNum++;
                }
            });
            this._context.drawVerticalLine(this._width - 0.5, this._rowsStartY, this._height);
        }
        var visibleRows = _.filter(this._rows, function (row) { return row.visible; });
        var y = 0.5 + this._rowsStartY;
        this._context.drawHorizontalLine(this._colsStartX, y, this._width);
        var headerRowY = _.chain(visibleRows).take(this._headersRowNum).foldl(function (memo, row) { return memo + row.height; }, y).value();
        _.each(headerCells, function (cell) { return cell.top = headerRowY; });
        _.each(visibleRows, function (row) {
            if (_this._headersRowNum == row.rowNum) {
                _this._context.drawHorizontalLine(_this._colsStartX, y, _this._width);
                y += _this._headerRow.height;
            }
            _this._context.drawHorizontalLine(_this._colsStartX, y, _this._width);
            _.each(row.getCells(), function (cell) { return cell.top = y; });
            row.drawGroup(y);
            y += row.height;
        });
        this._context.drawHorizontalLine(this._colsStartX, this._height - 0.5, this._width);
        this._context.finishDrawing();
        this.refreshAllCells();
    };
    Grid.prototype.refreshAllCells = function () {
        var _this = this;
        var headerCells = this._headerRow.getCells();
        _.each(headerCells, function (cell) { return cell.refresh(); });
        if (this._cells.length <= 0)
            return;
        _.chain(this._rows).
            filter(function (row) { return row.visible; }).
            map(function (row) { return row.rowNum; }).
            map(function (index) { return _this._cells[index]; }).
            each(function (row) { return _.each(row, function (cell) { return cell.refresh(); }); });
    };
    Grid.prototype.resize = function () {
        this._height = this.calculateHeight() + 2;
        this._width = this.calculateWidth() + 2;
        this._context.setSize(this._width, this._height);
    };
    return Grid;
})();
