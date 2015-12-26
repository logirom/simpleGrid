/// <reference path='./../typings/jquery/jquery.d.ts'/>

class GridContext {
    private _canvas : HTMLCanvasElement;
    private _context : CanvasRenderingContext2D;
    private _parent : JQuery = null;
    private _backColor : string;
    private _foreColor : string;
    private _clickHandlers : ((x : number, y : number) => void) [] = [];
    private _dblClickHandlers : ((x : number, y : number) => void) [] = [];
    private _keyDownHandlers : ((keyCode : number) => boolean) [] = [];
    private _textBox : JQuery;

    constructor (elem : JQuery, backColor : string, foreColor : string) {
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

        this._canvas.addEventListener("click", (ev : MouseEvent) => this.onClick (ev), false);
        this._canvas.addEventListener("dblclick", (ev : MouseEvent) => this.onDblClick(ev), false);
        this._canvas.addEventListener("keydown", (ev : KeyboardEvent) => this.onKeyDown(ev), false);
        elem.append(this._parent);
    }

    getTextBox (){
        if (this._textBox)
            return this._textBox;
        this._textBox = $(document.createElement("input"));
        this._textBox.attr("type", "text");
        this._textBox.css("position", "absolute");
        return this._textBox;
    }

    drawHorizontalLine (x, y, x1) {
        this._context.moveTo(x, y);
        this._context.lineTo(x1, y);
    }

    drawVerticalLine (x, y, y1) {
        this._context.moveTo(x, y);
        this._context.lineTo(x, y1);
    }

    startDrawing () {
        this._context.beginPath();
    }

    finishDrawing () {
        this._context.stroke();
    }

    setSize (w : number, h : number) {
        this._parent.css("height", h);
        this._parent.css("width", w);
        this._context.canvas.height = h;
        this._context.canvas.width = w;
        $(this._canvas).css("height", h);
        $(this._canvas).css("width", w);
    }

    getValueWidth (value, font : string) {
        return (value == null) ? this.getTextWidth(" ", font) : this.getTextWidth(<string>value, font);
    }

    setFocus () {
        this._canvas.focus();
    }

    appendElement (elem : JQuery){
        if (elem != null)
            this._context.canvas.parentElement.appendChild(elem.get(0));
    }

    drawRect(l : number, t : number, w : number, h : number, color : string){
        var oldStyle = this._context.strokeStyle;
        this._context.strokeStyle = color;
        this._context.strokeRect(l, t, w, h);
        this._context.strokeStyle = oldStyle;
    }

    fillRect(l : number, t : number, w : number, h : number, color : string) {
        var oldStyle = this._context.fillStyle;
        this._context.fillStyle = color;
        this._context.fillRect(l, t, w, h);
        this._context.fillStyle = oldStyle;
    }

    fillBackground() {
        this._context.fillStyle = this._backColor;
        this._context.fillRect(0, 0, this._context.canvas.width, this._context.canvas.height);
    }

    getTextWidth (text : string, font : string) {
        var oldFont = this._context.font;
        this._context.font = font;
        var w = this._context.measureText(text).width;
        this._context.font = oldFont;
        return w;
    }

    drawText (text : string, left : number, top : number, width : number, color : string, font : string, align : string = "left", baseline : string = "middle"){
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
    }

    click_bind (handler : (x : number, y : number) => void) { this._clickHandlers.push(handler); }
    click_unbind (handler : (x : number, y : number) => void){ this._clickHandlers = _.without(this._clickHandlers, handler); }

    dblClick_bind (handler : (x : number, y : number) => void) { this._dblClickHandlers.push(handler); }
    dblClick_unbind (handler : (x : number, y : number) => void){ this._dblClickHandlers = _.without(this._dblClickHandlers, handler); }

    keyDown_bind (handler : (keyCode : number) => boolean) { this._keyDownHandlers.push(handler); }
    keyDown_unbind (handler : (keyCode : number) => boolean){ this._keyDownHandlers = _.without(this._keyDownHandlers, handler); }

    adjustScrollPosition (left : number, top : number, width : number, height : number){
        if (left < this._canvas.parentElement.scrollLeft)
            this._canvas.parentElement.scrollLeft = left;

        if (top < this._canvas.parentElement.scrollTop)
            this._canvas.parentElement.scrollTop = top;

        if (left + width >= this._canvas.parentElement.clientWidth + this._canvas.parentElement.scrollLeft)
            this._canvas.parentElement.scrollLeft = this._canvas.parentElement.scrollLeft + width;
        if (top + height >= this._canvas.parentElement.clientHeight + this._canvas.parentElement.scrollTop)
            this._canvas.parentElement.scrollTop = this._canvas.parentElement.scrollTop + height;
    }

    private onClick(event : MouseEvent){ _.each(this._clickHandlers, handler => handler(event.layerX, event.layerY)); }
    private onDblClick(event : MouseEvent){ _.each(this._dblClickHandlers, handler => handler(event.layerX, event.layerY)); }

    private onKeyDown(event : KeyboardEvent){
        {
            _.each(this._keyDownHandlers, handler => {
                if (handler(event.keyCode)){
                    event.preventDefault();
                }
            });
        }
    }
}
