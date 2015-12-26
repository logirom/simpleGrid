/// <reference path="../typings/jquery/jquery.d.ts" />
/// <reference path="../typings/underscore/underscore.d.ts" />
declare enum ControlType {
    ReadOnly = 0,
    Text = 1,
    CheckBox = 2,
    ComboBox = 3,
    Expander = 4,
}
declare class GridContext {
    private _canvas;
    private _context;
    private _parent;
    private _backColor;
    private _foreColor;
    private _clickHandlers;
    private _dblClickHandlers;
    private _keyDownHandlers;
    private _textBox;
    constructor(elem: JQuery, backColor: string, foreColor: string);
    getTextBox(): JQuery;
    drawHorizontalLine(x: any, y: any, x1: any): void;
    drawVerticalLine(x: any, y: any, y1: any): void;
    startDrawing(): void;
    finishDrawing(): void;
    setSize(w: number, h: number): void;
    getValueWidth(value: any, font: string): number;
    setFocus(): void;
    appendElement(elem: JQuery): void;
    drawRect(l: number, t: number, w: number, h: number, color: string): void;
    fillRect(l: number, t: number, w: number, h: number, color: string): void;
    fillBackground(): void;
    getTextWidth(text: string, font: string): number;
    drawText(text: string, left: number, top: number, width: number, color: string, font: string, align?: string, baseline?: string): void;
    click_bind(handler: (x: number, y: number) => void): void;
    click_unbind(handler: (x: number, y: number) => void): void;
    dblClick_bind(handler: (x: number, y: number) => void): void;
    dblClick_unbind(handler: (x: number, y: number) => void): void;
    keyDown_bind(handler: (keyCode: number) => boolean): void;
    keyDown_unbind(handler: (keyCode: number) => boolean): void;
    adjustScrollPosition(left: number, top: number, width: number, height: number): void;
    private onClick(event);
    private onDblClick(event);
    private onKeyDown(event);
}
interface ICellOptions {
    backColor: string;
    foreColor: string;
    font: string;
}
declare class Cell {
    private _inEditMode;
    private _active;
    private _col;
    private _row;
    private _ctrlType;
    private _elem;
    private _label;
    private _value;
    private _cbPadding;
    private _top;
    private _left;
    private _height;
    private _width;
    private _backColor;
    private _foreColor;
    private _font;
    private _context;
    private _valueChangedHandlers;
    private _adjustWidth;
    private _comboBoxItems;
    constructor(options: ICellOptions, context: GridContext, row: number, col: number, wAdjuster: (col: number) => number, ctrlType?: ControlType);
    private createTextBox();
    private createCheckBox();
    private createComboBox();
    private createControlIntl(ctrlType);
    adjustWidth: (col: number) => number;
    col: number;
    row: number;
    top: number;
    left: number;
    height: number;
    width: number;
    foreColor: string;
    backColor: string;
    font: string;
    inEditMode: boolean;
    active: boolean;
    cellType: ControlType;
    label: string;
    value: any;
    element: JQuery;
    addItems(items: string[]): this;
    onEnterPressed(): void;
    visible: boolean;
    show(): void;
    private finishEdit(val);
    getWidth(): number;
    valueChanged_bind(handler: (val: any, row: number, col: number) => void): void;
    private drawData(val, left);
    refresh(): void;
    cancelEdit(): void;
}
interface IRowOptions {
    minHeight: number;
}
declare class Row {
    private _minHeight;
    private _height;
    private _visible;
    private _group;
    private _getCells;
    private _rowNum;
    visible: boolean;
    height: number;
    rowNum: number;
    constructor(options: IRowOptions, rowNum: number, getCells: (r: number) => Cell[]);
    getCells(): Cell[];
    adjustHeight(): void;
    addGroup(gr: RowsGroup): void;
    private getMaxActualHeight();
    drawGroup(y: number): void;
}
declare class RowsGroup {
    private _headRow;
    private _rows;
    private _refresh;
    private _expander;
    private _collapsed;
    private static createExpander();
    constructor(headRow: Row, rows: Row[], collapsed: boolean, context: GridContext, refresh: any);
    collapse(collapse: boolean): void;
    render(top: number, height: number): void;
}
interface IColumnOptions {
    minWidth: number;
    adjustWidth?: boolean;
}
declare class Column {
    private _minWidth;
    private _width;
    private _colNum;
    private _getCells;
    private _adjustWith;
    constructor(options: IColumnOptions, colNum: number, getCells: (cn: number) => Cell[]);
    colNum: number;
    width: number;
    private getMaxActualWidth(cells);
    adjustWidth(): number;
    refreshWidth(): void;
}
interface IColumnSourceConfig {
    field: string;
    name: string;
    type: ControlType;
    options?: any[];
}
interface IGridDataSourceConfig {
    columns: IColumnSourceConfig[];
    data: any[];
}
declare class GridDataSource {
    private _data;
    private _accessor;
    private _ctrlTypeCapturer;
    private _dataSetter;
    private _dataChangedHandlers;
    private _columns;
    private _rows;
    private _headers;
    private _optionsData;
    constructor(config: IGridDataSourceConfig);
    private createAccessor(data);
    private getObjAccessor(data);
    rowsNumber: number;
    columnsNumber: number;
    getData(i: number, j?: number): any;
    getCtrlType(i: number, j?: number): ControlType;
    getOptionsData(i: number, j: number): any[];
    updateData(val: any, i: number, j: number, context: any): void;
    getHeader(i: number): string;
    dataChanged_bind(handler: (context: any, i: number, j: number) => void): void;
    dataChanged_unbind(handler: (context: any, i: number, j: number) => void): void;
}
interface IGridConfig {
    rowsNumber?: number;
    headerRow?: number;
    headerHeight: number;
    columnsNumber?: number;
    cellOptions: ICellOptions;
    rowOptions: IRowOptions;
    columnOptions: IColumnOptions;
    dataSource?: GridDataSource;
}
declare class Grid {
    private _config;
    private _rows;
    private _cols;
    private _cells;
    private _rowGroups;
    private _activeCell;
    private _width;
    private _height;
    private _paintingSuspended;
    private _dataSource;
    private _context;
    private _headersRowNum;
    private _headerRow;
    private _includeHeader;
    private _colsStartX;
    private _rowsStartY;
    constructor(config: IGridConfig, elem: JQuery);
    private updateDataSource(val, row, col);
    suspendPainting(suspend: boolean): void;
    setRowsGroup(headRow: number, num: number, collapsed: boolean): void;
    collapseAll(): void;
    expandAll(): void;
    getCell(row: number, col: number): Cell;
    refresh(): void;
    private calculateHeight();
    private calculateWidth();
    private getColNumByX(x);
    private getRowByY(y);
    private changeActiveCell(newActive);
    private onClick(x, y);
    private onDblClick(x, y);
    private onKeyDown(keyCode);
    private render();
    private refreshAllCells();
    private resize();
}
