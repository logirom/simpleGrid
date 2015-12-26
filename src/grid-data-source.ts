/// <reference path='./../typings/underscore/underscore.d.ts'/>
/// <reference path='./common.ts'/>

interface IColumnSourceConfig {
    field : string;
    name : string;
    type : ControlType;
    options? : any[];
}

interface IGridDataSourceConfig {
    columns : IColumnSourceConfig [];
    data : any [];
}

class GridDataSource {

    private _data : any[][] = [];
    private _accessor : (i: number, j : number) => any;
    private _ctrlTypeCapturer : (i: number, j : number) => ControlType;
    private _dataSetter : (data : any, i: number, j : number) => void;
    private _dataChangedHandlers : ((context : any, i: number, j : number) => void) [] = [];
    private _columns : number = 0;
    private _rows : number = 0;
    private _headers : string[] = undefined;
    private _optionsData : any[][];

    constructor (config : IGridDataSourceConfig){
        if(!config.columns){
            if (config.data.length <= 0)
                return;
            this.createAccessor(config.data);
        } else {
            this._headers = _.map(config.columns, colConf => colConf.name);
            this._columns = config.columns.length;
            this._rows = config.data.length;
            this._accessor = (i, j) => {
                var col = config.columns[j];
                var obj = config.data[i];
                return (_.has(obj, col.field)) ? _.property(col.field)(obj) : "";
            };
            this._dataSetter = (data, i, j) => {
                var col = config.columns[j];
                var obj = config.data[i];
                if (_.has(obj, col.field)) {
                    obj[col.field] = data;
                };
            };
            this._optionsData = _.map(config.columns, colConf => colConf.options);
            this._ctrlTypeCapturer = (i, j) => {
                var col = config.columns[j];
                return col.type;
            }
        }
    }

    private createAccessor (data : any) {
        if (_.isArray(data[0])) {
            this._data = _.map(data, (d : any) => d);
            this._rows = data.length;
            this._accessor = (i, j) => this._data[i][j];
            this._dataSetter = (d, i, j) => this._data[i][j] = d;
            this._ctrlTypeCapturer = (i, j) => ControlType.Text;
        } else if (_.isObject(data[0])) {
            this.getObjAccessor(data);
        } else {
            this._data = _.map(data, (d : any) => [d]);
            this._rows = data.length;
            this._accessor = (i, j) => this._data[i][0];
            this._dataSetter = (d, i, j) => this._data[i][0] = d;
            this._ctrlTypeCapturer = (i, j) => ControlType.Text;
        }
    }

    private getObjAccessor (data : any []) {
        this._headers = _.chain(data).map(d => _.keys(d)).flatten().uniq().value();
        this._columns = this._headers.length;
        this._rows = data.length;
        this._accessor = (i, j) => {
            var k = this._headers[j];
            var obj = data[i];
            return (_.has(obj, k)) ? _.property(k)(obj) : "";
        };
        this._dataSetter = (d, i, j) => {
            var k = this._headers[j];
            var obj = data[i];
            if (_.has(obj, k)) {
                obj[k] = d;
            }
        };
        this._ctrlTypeCapturer = (i, j) => ControlType.ReadOnly;
    }

    get rowsNumber () { return this._rows; }

    get columnsNumber () {
        if (this._data && this._data.length > 0)
            return this._data[0].length;
        else
            return this._columns;
    }

    getData (i : number, j : number = 0) { return this._accessor (i, j); }
    getCtrlType (i : number, j : number = 0) { return this._ctrlTypeCapturer (i, j); }
    getOptionsData (i : number, j : number) {
        if (this._optionsData && this._optionsData[j]){
            return this._optionsData[j];
        } else { return []; }
    }

    updateData  (val : any, i : number, j : number, context : any) {
        this._dataSetter(val, i, j);
        _.each(this._dataChangedHandlers, handler => handler (context, i, j));
    }

    getHeader (i : number) {
        if (this._headers)
            return this._headers[i];
        else return undefined;
    }

    dataChanged_bind (handler : (context : any, i : number, j : number) => void){
        this._dataChangedHandlers.push(handler);
    }

    dataChanged_unbind (handler : (context : any, i : number, j : number) => void){
        _.without(this._dataChangedHandlers, handler);
    }
}