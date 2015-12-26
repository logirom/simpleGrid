/// <reference path='./../typings/underscore/underscore.d.ts'/>
/// <reference path='./cell-control.ts' />
/// <reference path='./grid-context.ts' />

interface IRowOptions {
    minHeight : number;
}

class Row {
    private _minHeight : number = 10;
    private _height : number = 0;
    private _visible : boolean = true;
    private _group : RowsGroup = null;
    private _getCells : (r : number) => Cell[];
    private _rowNum : number = 0;

    get visible () { return this._visible; }
    set visible (value : boolean) {
        this._visible = value;
        var cells = this._getCells(this._rowNum);
        _.each(cells, c =>  c.visible = value );
    }

    get height () { return this._height; }
    get rowNum () {return this._rowNum; }

    constructor (options : IRowOptions, rowNum : number, getCells : (r : number) => Cell[]){
        this._minHeight = options.minHeight;
        this._rowNum = rowNum;
        this._getCells = getCells;
    }

    getCells () { return this._getCells(this._rowNum); }

    adjustHeight () {
        var height = this.getMaxActualHeight();
        var cells = this._getCells(this._rowNum);
        if (height !== this._height) {
            _.each(cells, cell => cell.height = height);
            this._height = height;
        }
    }

    addGroup (gr : RowsGroup) { this._group = gr; }

    private getMaxActualHeight () : number {
        var cells = this._getCells(this._rowNum);
        return _.reduce(cells, (m : number, cell : Cell) => Math.max(m, _.isUndefined(cell) ? this._minHeight : cell.height), this._minHeight);
    }

    drawGroup (y : number) {
        if (this._group == null)
            return;
        this._group.render(y + 2, this._height - 4);
    }
}


class RowsGroup {
    private _headRow : Row;
    private _rows : Row [];
    private _refresh : () => void;
    private _expander : JQuery;
    private _collapsed : boolean;

    private static createExpander () : JQuery {
        var elem = $(document.createElement("button"));
        return elem.css("display", "float").css("position", "absolute").css("top", 0).css("left", 0).css("margin", 0);
    }

    constructor (headRow : Row, rows : Row [], collapsed : boolean, context : GridContext, refresh) {
        this._headRow = headRow;
        this._headRow.addGroup(this);
        this._rows = rows;
        this._refresh = refresh;

        this._expander = RowsGroup.createExpander();
        context.appendElement(this._expander);

        this._expander.click(() => this.collapse(!this._collapsed) );
        this.collapse (collapsed);
    }

    collapse (collapse : boolean) {
        this._collapsed = collapse;

        _.each(this._rows, r => r.visible = !collapse);
        if(this._collapsed)
            this._expander.text("+");
        else
            this._expander.text("-");
        this._refresh ();
    }

    render (top : number, height : number) {
        this._expander.css("top", top);
        this._expander.css("left", 0);
        this._expander.css("height", height);
        this._expander.css("width", height);
        this._expander.css("visibility", "visible");
        this._expander.css("padding", 0);
    }
}


