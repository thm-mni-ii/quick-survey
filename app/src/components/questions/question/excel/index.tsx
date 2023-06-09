import { QuestionTypeProps } from '../index';
import { useRef } from 'preact/compat';
import { useEffect, useState } from 'preact/hooks';
import { SpreadsheetEvaluator } from '../../../../lib/spreadsheet-evaluator';
import { createDataGrid } from '../../../../lib/grid';
import { UndoManager } from '../../../../lib/undo-manager';
import ExcelBar from './bar';
import structuredClone from '@ungap/structured-clone';
import { Button } from '@mui/material';


/**
 * The Excel question component
 * @param {Object} question the excel question to display
 * @param {function} onChange called when the input is changed
 * @constructor
 */
export default function ExcelQuestion({ question, onChange }: QuestionTypeProps) {
  const gridParent = useRef<any>();


  const [formulaBarValue, setFormulaBarValue] = useState();
  const [formulaBarChangeHandler, setFormulaBarChangeHandler] = useState<(value: string|undefined) => void>(() => {});
  const [data, setData] = useState(structuredClone(question.options.data));

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

    const navigate = (dy: number, dx: number) => {
      const activeCell = grid.activeCell;
      const nx = activeCell.columnIndex+dx;
      const ny = activeCell.rowIndex+dy;
      if (!(nx >= 0 && ny >= 0 && ny < data.length && nx < data[0].length)) return;
      grid.setActiveCell(nx, ny);
      grid.gotoCell(nx, ny);
      selectionChangeHandler(null);
    };

    const formatHandler = (cell: any) => {
      let value = cell.value;
      if (value.toString().startsWith('=')) {
        try {
          value = evaluate.get(cell.viewRowIndex, cell.viewColumnIndex)?.toString();
        } catch (e) {
          console.error('An error occurred', value, e);
        }
      }

      if (value === undefined) {
        cell.formattedValue = undefined;
        return;
      }

      if (!isNaN(Number.parseFloat(value))) {
        cell.horizontalAlignment = 'right';
      }
      if (typeof value === 'string' && value.startsWith('!ERROR! ')) {
        cell.color = 'red';
        value = value.slice('!ERROR! '.length);
      }
      cell.formattedValue = value.toString();
    };

    const renderHandler = (event: any) => {
      const cell = event.cell;

      if (cell.color) {
        event.ctx.fillStyle = cell.color;
      }
    };

    const gridChangeHandler = (newData: any[][]) => {
      const cells: any[] = [];
      for (let i = 0; i < newData.length; i++) {
        for (let j = 0; j < newData[i].length; j++) {
          const newValue = newData[i][j];
          let value;
          value = Number.parseFloat(newValue);
          if (isNaN(value)) {
            value = newValue;
          }
          const cell = grid.getVisibleCellByIndex(j, i);
          try {
            data[cell.viewRowIndex][cell.viewColumnIndex] = value;
          } catch (e) {/* Do nothing */}
          cells.push(cell);
        }
      }

      evaluate.evaluate(data).then(() => {
        for (const cell of cells) {
          grid.gotoCell(cell.viewColumnIndex, cell.viewRowIndex);
          formatHandler(cell);
        }
      });
      onChange({ data });
    };
    const cellChangeHandler = (cell: any, newValue: any = cell.value) => {
      let value;
      value = Number.parseFloat(newValue);
      if (isNaN(value)) {
        value = newValue;
      }
      try {
        data[cell.viewRowIndex][cell.viewColumnIndex] = value;
      } catch (e) {/* Do nothing */}
      evaluate.evaluate(data).then(() => {
        grid.gotoCell(cell.viewColumnIndex, cell.viewRowIndex);
        formatHandler(cell);
      });
      onChange({ data });
    };

    const formatTextHandler = (event: any) => formatHandler(event.cell);
    const editEndHandler = (event: any) => {
      cellChangeHandler(event.cell, event.value);
      undoManager.push(data);
      selectionChangeHandler(event);
    };
    const afterPasteHandler = (event: any) => setTimeout(
        () => {
          event.cells.forEach(
              (cell: any) => {
                const c = grid.getVisibleCellByIndex(cell[1], cell[0]);
                cellChangeHandler(c);
              },
          );
          undoManager.push(data);
        }, 0,
    );
    const onKeyPress = (event: KeyboardEvent) => {
      let newData: any[][]|undefined;
      if (event.ctrlKey && event.code === 'KeyY') {
        newData = undoManager.undo();
      } else if (event.ctrlKey && event.code === 'KeyZ') {
        newData = undoManager.redo();
      } else if (['ArrowLeft', 'ArrowUp', 'ArrowRight', 'ArrowDown'].includes(event.code)) {
        if (!grid.hasFocus && document.activeElement?.classList.contains('canvas-datagrid-control-input')) {
          const [dy, dx] = {
            'ArrowLeft': [0, -1],
            'ArrowUp': [-1, 0],
            'ArrowRight': [0, 1],
            'ArrowDown': [1, 0],
          }[event.code]!!;
          navigate(dy, dx);
        } else {
          selectionChangeHandler(null);
          return;
        }
      } else {
        return;
      }
      event.preventDefault();
      if (!newData) return;
      gridChangeHandler(newData);
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
    grid.addEventListener('rendertext', renderHandler);
    document.addEventListener('keydown', onKeyPress);

    setFormulaBarChangeHandler(() => (value: string|undefined, newLine: boolean) => {
      if (!value) return;
      const activeCell = grid.activeCell;
      const cell = grid.getVisibleCellByIndex(activeCell.columnIndex, activeCell.rowIndex);
      cellChangeHandler(cell, value);
      undoManager.push(data);
      navigate(1, 0);
      setFormulaBarValue(value as any);
      grid.focus();
      return undefined;
    });

    const gc = grid;
    return () => {
      gc.removeEventListener('formattext', formatTextHandler);
      gc.removeEventListener('endedit', editEndHandler);
      gc.removeEventListener('afterpaste', afterPasteHandler);
      gc.removeEventListener('selectionchanged', selectionChangeHandler);
      gc.removeEventListener('rendertext', renderHandler);
      document.removeEventListener('keydown', onKeyPress);
    };
  }, [data, grid, question, onChange, setFormulaBarValue, setFormulaBarChangeHandler]);

  const resetSheet = () => {
    if (!confirm('Möchten Sie das Spreadsheet zurücksetzen? Alle Änderungen gehen unwiderruflich verloren.')) return;
    setData(structuredClone(question.options.data));
  };

  return <>
    <ExcelBar defaultValue={formulaBarValue} onChange={formulaBarChangeHandler} />
    <div ref={gridParent} style={{ overflow: 'auto' }} />
    <Button onClick={resetSheet}>Zurücksetzen</Button>
  </>;
}
