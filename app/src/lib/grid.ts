// @ts-ignore
import canvasDatagrid from 'canvas-datagrid';

/**
 * Creates a dataGrid in the given parent
 * @param {Object} parentNode the parentNode of the dataGrid
 * @return {Object} the create dataGrid
 */
export function createDataGrid(parentNode: any): any {
  return canvasDatagrid({
    parentNode,
    data: [],
    allowColumnReordering: false,
    allowFreezingColumns: false,
    allowFreezingRows: false,
    allowGroupingColumns: false,
    allowGroupingRows: false,
    allowRowReordering: false,
    allowSorting: false,
    showClearSettingsOption: false,
    showColumnSelector: false,
    showFilter: false,
    showNewRow: false,
    showOrderByOption: false,
    autoResizeColumns: true,
    autoResizeRows: true,
    singleSelectionMode: true,
  });
}
