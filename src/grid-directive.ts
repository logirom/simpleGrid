///<reference path='./grid.ts' />
///<reference path='../typings/angularjs/angular.d.ts' />


var GridDirective = () => {
    var link = (scope: ng.IScope,
                  instanceElement: ng.IAugmentedJQuery,
                  instanceAttributes: ng.IAttributes,
                  controller: any,
                  transclude: ng.ITranscludeFunction) => {

        var cellOptions = new CellOptions();
        var grid = new Grid(cellOptions);

        grid.applyTo(instanceElement.get(0));

        grid.suspendPainting(true);
        grid.setColumnCount(10);
        grid.setRowCount(10);

        for (var i = 0; i < 10; i++) {
            grid.getCell(i, 0).data = String(i + 1);
        }

        var cell = grid.getCell(0, 1);
        cell.cellType = Editor.Text;
        cell.data = "example long long";
        cell = grid.getCell(1, 1);
        cell.cellType = Editor.CheckBox;
        cell.label = "it's checkbox";
        cell.valueChanged = (v) => {
            console.info(v);
        };
        cell = grid.getCell(1, 3);
        cell.cellType = Editor.ComboBox;
        cell.addItems(["1", "2", "3"]);
        cell.valueChanged = (v) => {
            console.info(v);
        }

        //grid.setRowsGroup(5, 3, true);
        //grid.setRowsGroup(0, 3, true);
        grid.suspendPainting(false);
    };

    var res : ng.IDirective;
    res = {
        link : link
    }
    return res;
    //public link: (scope: ng.IScope, element: ng.IAugmentedJQuery, attrs: ng.IAttributes) => void;
    //public scope = {};
    //public restrict = 'A';

}


