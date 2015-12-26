/// <reference path='../typings/jquery/jquery.d.ts'/>
/// <reference path='../typings/underscore/underscore.d.ts'/>

/// <reference path='./common.ts'/>
/// <reference path='./grid-context.ts'/>



interface ICellOptions {
    backColor : string;
    foreColor : string;
    font : string;
}

class Cell {
    private _inEditMode : boolean = false;
    private _active : boolean = false;
    private _col : number = -1;
    private _row : number = -1;
    private _ctrlType : ControlType = ControlType.ReadOnly;
    private _elem : JQuery = null;
    private _label : string = "";
    private _value : any = null;
    private _cbPadding : number = 5;
    private _top : number;
    private _left : number;
    private _height : number = 25;
    private _width : number = 10;
    private _backColor : string;
    private _foreColor : string;
    private _font : string;
    private _context : GridContext;
    private _valueChangedHandlers : ((value : any, row : number, col : number) => void)[] = [];
    private _adjustWidth : (col : number) => number = (col : number) => this._width;
    private _comboBoxItems : JQuery [] = [] ;

    constructor (options : ICellOptions, context : GridContext, row : number, col : number, wAdjuster : (col : number) => number, ctrlType : ControlType = ControlType.ReadOnly ) {
        this._context = context;
        this._backColor = options.backColor;
        this._foreColor = options.foreColor;
        this._font = options.font;
        this.cellType = ctrlType;
        this._row = row;
        this._col = col;
        this._adjustWidth = wAdjuster;
    }

    private createTextBox () : JQuery  {

        var elem = this._context.getTextBox();
        elem.on("keydown", e => {
            if(!this._inEditMode)
                return;
            if (e.keyCode === 13){
                if (this._value == this._elem.val()) {
                    this.cancelEdit();
                    return;
                }
                this._value = this._elem.val();
                this._elem.css("visibility", "hidden");
                this._elem.get(0).onkeypress = null;
                this._context.setFocus();
                this._inEditMode = false;
                this.finishEdit (this._value)
            }
            else if (e.keyCode === 27)
                this.cancelEdit();
        });
        return elem;
    }

    private createCheckBox () : JQuery {
        var elemHtml = document.createElement("input");
        var elem = $(elemHtml);
        elem.attr("type", "checkbox").css("checked");

        elem.get(0).addEventListener("click", (e) => {
            var old = elemHtml.hasAttribute("checked");
            if (old)
                elemHtml.removeAttribute("checked");
            else
                elemHtml.setAttribute("checked", "");
            this.finishEdit(!old);

        }, false);
        return elem;
    }

    private createComboBox () : JQuery {
        var elem = $(document.createElement("select"));
        elem.on("change", e => this.finishEdit(elem.val()));
        elem.keydown(ev => {
            if (ev.keyCode == 27)
                this.cancelEdit();
        });
        return elem;
    }

    private createControlIntl (ctrlType : ControlType) : JQuery {
        switch ( ctrlType ) {
            case ControlType.CheckBox : return this.createCheckBox ();
            case ControlType.Text : return this.createTextBox ();
            case ControlType.ComboBox : return this.createComboBox ();
        }
        return null;
    }

    get adjustWidth () { return this._adjustWidth; }

    set col (c : number) { this._col = c; }
    get col () { return this._col; }
    set row (r : number) { this._row = r; }
    get row () { return this._row; }

    set top (t : number) { this._top = t; }
    get top () { return this._top; }

    set left (l : number) { this._left = l; }
    get left () { return this._left; }

    set height (h : number) { this._height = h; }
    get height () { return this._height; }
    set width (w : number) { this._width = w; }
    get width () { return this._width; }

    set foreColor (fc : string) { this._foreColor = fc; }
    get foreColor () { return this._foreColor; }
    set backColor (bc : string) { this._backColor = bc; }
    get backColor () { return this._backColor; }
    set font (f : string) { this._font = f; }
    get font () { return this._font; }

    set inEditMode (on : boolean) {
        this._inEditMode = on;
        this.refresh();
    }
    get inEditMode () { return this._inEditMode; }

    set active (active : boolean) {
        this._active = active;
        if (!active)
            this.cancelEdit();
        this.refresh();
    }
    get active () { return this._active; }

    set cellType (ctrlType : ControlType) {
        if (this._elem != null) {
            this._elem.remove();
            this._elem = null;
        }
        this._elem = this.createControlIntl (ctrlType);
        this._ctrlType = ctrlType;
        this._context.appendElement(this._elem);
        if (this._elem != null) {
            this._elem = this._elem.css("visibility", "hidden");
        }
        this._width = this._adjustWidth(this._col);
        this.refresh();
    }

    set label (lbl : string) {
        this._label = lbl;
        this._width = this._adjustWidth(this._col);
    }
    get label () { return this._label; }

    set value (value : any) {
        this._value = value;
        this._width = this._adjustWidth(this._col);
        this.refresh();
    }
    get value () { return this._value; }

    get element () { return this._elem; }

    addItems (items : string []) {
        if (this._ctrlType != ControlType.ComboBox){
            return this;
        }

        var self = this;
        _.each(items, (item : string) => {
            var opt = $(document.createElement('option'));
            opt.text(item);
            opt.val(item);
            self._elem.append(opt);
            this._comboBoxItems.push(opt);
        });
        this._width = this._adjustWidth(this._col);
        this.refresh();
    }

    onEnterPressed () {
        switch (this._ctrlType) {
            case ControlType.CheckBox :
                this._elem.click();
                this._context.setFocus();
                break;
            case ControlType.ComboBox :
            case ControlType.Text :
                this._inEditMode = true;
                this._elem.focus();
                break;
        }
        this.show();
    }

    set visible (value : boolean) {
        if(this._elem != null) {
            this._elem.css("visibility", value ? "visible" : "hidden");
        }

        if (this._ctrlType == ControlType.Text && !this._inEditMode){
            this._elem.css("visibility", "hidden");
        }
    }

    show () {
        if (this._elem){
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
        } else if (this._ctrlType == ControlType.ComboBox){
            if(inEditMode) {
                this._elem.css("visibility", "visible");
                this._elem.css("border", "0px");
                _.each(this._comboBoxItems, item => item.css("font", this._font).css("color", this._foreColor).css("background-color", this._backColor));
                _.each(this._comboBoxItems, item => item.prop('selected', false));
                var item = _.find(this._comboBoxItems, item => item.val() == this._value);
                if (item)
                    item.prop('selected', true);
            }
            else if (this._value){
                this._elem.css("visibility", "hidden");
                this.drawData(this._value.toString(), this._left);
            }
        } else if (this._ctrlType == ControlType.Text) {
            if(inEditMode) {
                this._elem.val(this._value);
                this._elem.css("visibility", "visible");
                this._elem.focus();
                this._elem.select();
            }
            else if (this._value){
                this._elem.css("visibility", "hidden");
                this.drawData(this._value.toString(), this._left);
            }
        } else if (this._value) {
            this.drawData(this._value.toString(), this._left);
        }
    }

    private finishEdit (val : any) {
        this._value = val;
        this._width = this._adjustWidth(this._col);
        _.each(this._valueChangedHandlers, cb => {
            try {
                cb(val, this._row, this._col);
            }
            catch (ex) {
                console.error(ex);
            }
        });
    }

    getWidth () {
        if (this._ctrlType == ControlType.CheckBox) {
            return this._context.getTextWidth(this._label, this._font) + this._elem.width() + this._cbPadding * 3;
        }
        var textWidth = this._context.getValueWidth (this._value, this._font);
        var addition = this._cbPadding * 2;
        return textWidth + addition;
    }

    valueChanged_bind (handler : (val : any, row : number, col : number) => void) {
        this._valueChangedHandlers.push(handler);
    }

    private drawData (val : string, left : number) {
        while(this._context.getValueWidth(val, this._font) >= this._width){
            val = val.substring(0, val.length - 2);
        }
        this._context.drawText(val, this._cbPadding + left, this._top + this._height / 2, this._width - this._cbPadding * 2, this._foreColor, this._font)
    }

    refresh () {
        this._context.fillRect(this._left + 0.5, this._top + 0.5, this._width - 1, this._height -1, this._backColor);
        if (this._active)
            this._context.drawRect(this._left + 1, this._top + 1, this._width - 2, this._height - 2, this._foreColor);
        this.show();
    }

    cancelEdit () {
        if (!this._inEditMode)
            return;
        if (this._ctrlType == ControlType.Text || this._ctrlType == ControlType.ComboBox ) {
            this._elem.css("visibility", "hidden");
            this._elem.get(0).onkeypress = null;
        }
        this._context.setFocus ();
        this._inEditMode = false;
        this.refresh();
    }
}