import { QuestionTypeProps } from '../index';
import { useRef } from 'preact/compat';
import { useEffect, useState } from 'preact/hooks';
import { SpreadsheetEvaluator } from '../../../../lib/spreadsheet-evaluator';
import { createDataGrid } from '../../../../lib/grid';
import { UndoManager } from '../../../../lib/undo-manager';
import ExcelBar from './bar';


/**
 * The Excel question component
 * @param {Object} question the excel question to display
 * @param {function} onChange called when the input is changed
 * @constructor
 */
export default function ExcelQuestion({ question, onChange }: QuestionTypeProps) {
  const gridParent = useRef<any>();

  const data = question.options.data;

  const [formulaBarValue, setFormulaBarValue] = useState();
  const [formulaBarChangeHandler, setFormulaBarChangeHandler] = useState<(value: string|undefined) => void>(() => {});

  const [grid, setGrid] = useState<any>();
  useEffect(() => {
    setGrid(createDataGrid(gridParent.current));

    return () => {
      document.querySelector('.canvas-datagrid-edit-input')?.remove();
      setGrid(undefined);
    };
  }, [gridParent]);

  useEffect(() => {
    if (!grid) return;
    const evaluate = new SpreadsheetEvaluator();
    const undoManager = new UndoManager<any[][]>();
    evaluate.evaluate(data).then(() => {});

    grid.data = data;
    undoManager.push(data);

    const formatHandler = (cell: any) => {
      let value = cell.value;
      if (value.toString().startsWith('=')) {
        try {
          value = evaluate.get(cell.viewRowIndex, cell.viewColumnIndex)?.toString();
        } catch (e) {
          console.error('An error occurred', value, e);
        }
      }
      if (!isNaN(Number.parseInt(value, 10))) {
        cell.horizontalAlignment = 'right';
      }
      if (value) {
        cell.formattedValue = value.toString();
      } else {
        cell.formattedValue = undefined;
      }
    };

    const changeHandler = (cell: any, newValue: any = cell.value) => {
      let value;
      value = Number.parseInt(newValue, 10);
      if (isNaN(value)) {
        value = newValue;
      }
      try {
        data[cell.viewRowIndex][cell.viewColumnIndex] = value;
        evaluate.evaluate(data).then(() => {
          grid.gotoCell(cell.viewColumnIndex, cell.viewRowIndex);
          formatHandler(cell);
        });
      } catch (e) {/* Do nothing */}
      onChange({ data });
    };

    const formatTextHandler = (event: any) => formatHandler(event.cell);
    const editEndHandler = (event: any) => {
      changeHandler(event.cell, event.value);
      undoManager.push(data);
    };
    const afterPasteHandler = (event: any) => setTimeout(
        () => {
          event.cells.forEach(
              (cell: any) => {
                const c = grid.getVisibleCellByIndex(cell[1], cell[0]);
                changeHandler(c);
              },
          );
          undoManager.push(data);
        }, 0,
    );
    const onKeyPress = (event: KeyboardEvent) => {
      let newData: any[][]|undefined;
      if (event.ctrlKey && event.keyCode === 26) {
        newData = undoManager.undo();
      } else if (event.ctrlKey && event.keyCode === 25) {
        newData = undoManager.redo();
      }
      if (!newData) return;
      for (let i = 0; i < newData.length; i++) {
        for (let j = 0; j < newData[i].length; j++) {
          changeHandler(grid.getVisibleCellByIndex(j, i), newData[i][j]);
        }
      }
    };
    const selectionChangeHandler = (event: any) => {
      setTimeout(() => {
        const activeCell = grid.activeCell;
        const cell = grid.getVisibleCellByIndex(activeCell.columnIndex, activeCell.rowIndex);
        setFormulaBarValue(cell.value);
      }, 0);
    };

    grid.addEventListener('formattext', formatTextHandler);
    grid.addEventListener('endedit', editEndHandler);
    grid.addEventListener('afterpaste', afterPasteHandler);
    grid.addEventListener('selectionchanged', selectionChangeHandler);
    document.addEventListener('keypress', onKeyPress);

    setFormulaBarChangeHandler(() => (value: string|undefined) => {
      if (!value) return;
      const activeCell = grid.activeCell;
      const cell = grid.getVisibleCellByIndex(activeCell.columnIndex, activeCell.rowIndex);
      changeHandler(cell, value);
      setFormulaBarValue(value as any);
      return undefined;
    });

    const gc = grid;
    return () => {
      gc.removeEventListener('formattext', formatHandler);
      gc.removeEventListener('endedit', editEndHandler);
      gc.removeEventListener('afterpaste', afterPasteHandler);
      gc.removeEventListener('selectionchanged', selectionChangeHandler);
      document.removeEventListener('keypress', onKeyPress);
    };
  }, [data, grid, question, onChange, setFormulaBarValue, setFormulaBarChangeHandler]);

  return <>
    <ExcelBar defaultValue={formulaBarValue} onChange={formulaBarChangeHandler} />
    <div ref={gridParent} style={{ overflow: 'auto' }} />
  </>;
}
