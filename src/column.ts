/// <reference path='./../typings/underscore/underscore.d.ts'/>
/// <reference path='./cell-control.ts' />

interface IColumnOptions {
    minWidth : number;
    adjustWidth? : boolean
}

class Column {
    private _minWidth : number;
    private _width : number = 0;
    private _colNum : number;
    private _getCells : (colNum : number) => Cell[];
    private _adjustWith : boolean;

    constructor (options : IColumnOptions, colNum : number, getCells : (cn : number) => Cell[]){
        this._colNum = colNum;
        this._minWidth = options.minWidth;
        this._width = this._minWidth;
        this._getCells = getCells;
        this._adjustWith = (!options.adjustWidth) ? true : options.adjustWidth;
    }

    get colNum () { return this._colNum; }
    get width () { return this._width; }

    private getMaxActualWidth (cells : Cell[]) : number {
        var widths = _.map(cells, cell => (!cell) ? this._minWidth : cell.getWidth());
        return _.reduce(widths, (m : number, w : number) => Math.max(m, w), this._minWidth);
    }

    adjustWidth () {
        if (this._adjustWith){
            var width = this.getMaxActualWidth(this._getCells(this._colNum));
            if (width !== this._width)
                this._width = width;
            return width;
        }
        else
            return this._minWidth;
    }

    refreshWidth () {
        var cells = this._getCells(this._colNum);
        var width = this._adjustWith ? this.getMaxActualWidth(cells) : this._minWidth;
        _.each(cells, cell => cell.width = width);
        this._width = width;
    }
}

