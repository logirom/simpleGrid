// / <reference path='../typings/underscore/underscore.d.ts'/>
/// <reference path='../typings/jquery/jquery.d.ts'/>

/// <reference path='./cell-control.ts' />
/// <reference path='./row.ts' />
/// <reference path='./column.ts' />
/// <reference path='./grid-context.ts' />
/// <reference path='./grid-data-source.ts' />

interface IGridConfig {
    rowsNumber? : number;
    headerRow? : number;
    headerHeight : number;
    columnsNumber? : number;
    cellOptions : ICellOptions;
    rowOptions : IRowOptions;
    columnOptions : IColumnOptions;
    dataSource? : GridDataSource;
}

class Grid {

    private _config:IGridConfig;
    private _rows:Row[] = [];
    private _cols:Column[] = [];
    private _cells:Cell[][] = [];
    private _rowGroups:RowsGroup[] = [];
    private _activeCell:Cell = null;
    private _width:number = 0;
    private _height:number = 0;
    private _paintingSuspended:boolean = true;
    private _dataSource:GridDataSource;
    private _context:GridContext;
    private _headersRowNum:number;
    private _headerRow:Row;
    private _includeHeader:boolean = false;

    private _colsStartX:number = 20;
    private _rowsStartY:number = 10;

    constructor(config:IGridConfig, elem:JQuery) {
        this._config = config;

        this._context = new GridContext(elem, this._config.cellOptions.backColor, this._config.cellOptions.foreColor);
        this._context.click_bind((x, y) => this.onClick(x, y));
        this._context.dblClick_bind((x, y) => this.onDblClick(x, y));
        this._context.keyDown_bind((keyCode) => this.onKeyDown(keyCode));

        var rows = !config.rowsNumber ? 1 : config.rowsNumber;
        var cols = !config.columnsNumber ? 1 : config.columnsNumber;
        this._headersRowNum = (typeof this._config.headerRow === 'undefined') ? -1 : this._config.headerRow;
        this._includeHeader = (typeof this._config.headerRow !== 'undefined');


        if (this._config.dataSource) {
            this._dataSource = this._config.dataSource;
            rows = this._dataSource.rowsNumber;
            cols = this._dataSource.columnsNumber;
            this._dataSource.dataChanged_bind((context, i, j) => {
                if (context === this)
                    return;
                this._cells[i][j].value = this._dataSource.getData(i, j);
            });
        }

        var headerCells:Cell[] = [];
        for (var i = 0; i < cols; i++) {
            var col = new Column(this._config.columnOptions, i, cn => _.map(this._cells, row => row[cn]));
            this._cols.push(col);
            if (!this._includeHeader)
                continue;
            var cell = new Cell(this._config.cellOptions, this._context, -1, i, colNum => {
                var w = this._cols[colNum].adjustWidth();
                this.refresh();
                return w;
            });
            headerCells.push(cell);
        }
        this._headerRow = new Row(this._config.rowOptions, -1, rowNum => headerCells);

        for (var i = 0; i < rows; i++) {
            this._cells[i] = [];
            this._rows.push(new Row(this._config.rowOptions, i, rowNum => this._cells[rowNum]));
            for (var j = 0; j < cols; j++) {
                var cell = new Cell(this._config.cellOptions, this._context, i, j, colNum => {
                    var w = this._cols[colNum].adjustWidth();
                    this.refresh();
                    return w;
                });
                if (this._dataSource) {
                    var cellType = this._dataSource.getCtrlType(i, j);
                    cell.cellType = cellType;
                    if (cellType == ControlType.ComboBox) {
                        cell.addItems(this._dataSource.getOptionsData(i, j));
                    }
                    cell.value = this._dataSource.getData(i, j);
                    cell.valueChanged_bind((val, row, col) => this.updateDataSource(val, row, col));
                }
                this._cells[i][j] = cell;
            }
        }

        if (this._dataSource && this._includeHeader)
            _.each(this._headerRow.getCells(), (cell, i) =>  cell.value = this._dataSource.getHeader(i));
        this._paintingSuspended = false;
    }

    private updateDataSource(val:any, row:number, col:number) {
        if (this._dataSource)
            this._dataSource.updateData(val, row, col, this);
    }

    suspendPainting(suspend:boolean) {
        if (!suspend && this._paintingSuspended) {
            this._paintingSuspended = suspend;
            this.render();
        }
        this._paintingSuspended = suspend;
    }

    setRowsGroup(headRow:number, num:number, collapsed:boolean) {
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

        var group = new RowsGroup(row, groupRows, collapsed, this._context, () => this.render());
        this._rowGroups.push(group);

    }

    collapseAll() {
        _.each(this._rowGroups, (rg:RowsGroup) => rg.collapse(true));
    }

    expandAll() {
        _.each(this._rowGroups, (rg:RowsGroup) => rg.collapse(false));
    }

    getCell(row:number, col:number) {
        return this._cells[row][col];
    }

    refresh() {
        this.render();
    }

    private calculateHeight():number {
        var headersRowHeight = this._includeHeader ? this._headerRow.height : 0;
        _.each(this._rows, r => r.adjustHeight());
        if (this._rows.length == 0)
            return this._rowsStartY + headersRowHeight;
        var visibleRows = _.filter(this._rows, row => row.visible);
        return _.reduce(visibleRows, (total:number, row:Row)  => (row.height + total), this._rowsStartY) + headersRowHeight;
    }

    private calculateWidth():number {
        _.each(this._cols, col => col.adjustWidth());
        if (this._cols.length > 0)
            return _.reduce(this._cols, (total:number, col:Column) => col.width + total, this._colsStartX);
        else
            return this._colsStartX;
    }

    private getColNumByX(x:number) {
        if (x < this._colsStartX)
            return -1;
        var i = 0;
        var currLeft = this._colsStartX;
        while (i < this._cols.length && currLeft <= x)
            currLeft += this._cols[i++].width;
        return i - 1;
    }

    private getRowByY(y:number):Row {
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
    }

    private changeActiveCell(newActive:Cell) {
        if (!newActive)
            return;
        if (this._activeCell != null)
            this._activeCell.active = false;

        newActive.active = true;
        this._activeCell = newActive;
        this._context.adjustScrollPosition(this._activeCell.left, this._activeCell.top, this._activeCell.width, this._activeCell.height);
    }

    private onClick(x:number, y:number) {
        var row = this.getRowByY(y);
        var col = this.getColNumByX(x);
        if (row == null) return;
        var rowCells = row.getCells();
        if (col < 0 || col >= rowCells.length)
            return;
        this.changeActiveCell(rowCells[col]);
    }

    private onDblClick(x:number, y:number) {
        var row = this.getRowByY(y);
        var colNum = this.getColNumByX(x);
        if (row == null || colNum < 0)
            return;
        if (this._activeCell == null || this._activeCell.row != row.rowNum || this._activeCell.col != colNum)
            this.onClick(x, y);
        this._activeCell.inEditMode = true;
    }

    private onKeyDown(keyCode:number):boolean {
        if (!this._activeCell) {
            this.changeActiveCell(this._cells[0][0]);
            return false;
        }

        var rowNum = this._activeCell.row;
        var colNum = this._activeCell.col;
        if (rowNum < 0 || colNum < 0)
            return false;

        switch (keyCode) {
            case  37 : // left
                if (this._activeCell.inEditMode)
                    return false;
                this.changeActiveCell(this._cells[rowNum][colNum - 1]);
                return true;
            case 39 : // right
                if (this._activeCell.inEditMode)
                    return false;
                this.changeActiveCell(this._cells[rowNum][colNum + 1]);
                return true;
            case 38 : // up
                if (this._activeCell.inEditMode)
                    return false;
                do {
                    rowNum = rowNum - 1;
                    if (!this._rows[rowNum]) return true;
                } while (!this._rows[rowNum].visible);
                this.changeActiveCell(this._cells[rowNum][colNum]);
                return true;
            case 40 : // down
                if (this._activeCell.inEditMode)
                    return false;
                do {
                    rowNum = rowNum + 1;
                    if (!this._rows[rowNum]) return true;
                } while (!this._rows[rowNum].visible);
                this.changeActiveCell(this._cells[rowNum][colNum]);
                return true;
            case 13 :
                this._activeCell.onEnterPressed();
                return true;
            case 27 :
                if (this._activeCell.inEditMode)
                    this._activeCell.cancelEdit();
                return false;
            default :
                if (!this._activeCell.inEditMode)
                    this._activeCell.inEditMode = true;
                return false;
        }
    }

    private render() {
        if (this._paintingSuspended)
            return;

        _.each(this._cols, col => col.refreshWidth());
        _.each(this._rows, row => row.adjustHeight());
        this._headerRow.adjustHeight();

        this.resize();
        this._context.startDrawing();
        this._context.fillBackground();

        var headerCells = this._headerRow.getCells();

        if (this._cols.length > 0) {
            var colNum = 0;
            var x = 0.5 + this._colsStartX;

            _.each(this._cols, col => {
                this._context.drawVerticalLine(x, this._rowsStartY, this._height);
                if (colNum < this._cols.length) {
                    for (var i = 0; i < this._rows.length; i++)
                        this._cells[i][colNum].left = x;
                    if (this._includeHeader)
                        headerCells[colNum].left = x;
                    x += col.width;
                    colNum++;
                }
            });
            this._context.drawVerticalLine(this._width - 0.5, this._rowsStartY, this._height);
        }
        var visibleRows = _.filter(this._rows, row => row.visible);
        var y = 0.5 + this._rowsStartY;
        this._context.drawHorizontalLine(this._colsStartX, y, this._width);
        var headerRowY = _.chain(visibleRows).take(this._headersRowNum).foldl((memo, row) => memo + row.height, y).value();
        _.each(headerCells, cell => cell.top = headerRowY);
        _.each(visibleRows, row => {
            if (this._headersRowNum == row.rowNum) {
                this._context.drawHorizontalLine(this._colsStartX, y, this._width);
                y += this._headerRow.height;
            }
            this._context.drawHorizontalLine(this._colsStartX, y, this._width);
            _.each(row.getCells(), cell => cell.top = y);
            row.drawGroup(y);
            y += row.height;
        });
        this._context.drawHorizontalLine(this._colsStartX, this._height - 0.5, this._width);
        this._context.finishDrawing();
        this.refreshAllCells();
    }

    private refreshAllCells() {
        var headerCells = this._headerRow.getCells();
        _.each(headerCells, cell =>  cell.refresh());
        if (this._cells.length <= 0)
            return;
        _.chain(this._rows).
            filter(row => row.visible).
            map(row => row.rowNum).
            map(index => this._cells[index]).
            each(row => _.each(row, cell => cell.refresh()));
    }

    private resize() {
        this._height = this.calculateHeight() + 2;
        this._width = this.calculateWidth() + 2;
        this._context.setSize(this._width, this._height)
    }

}
