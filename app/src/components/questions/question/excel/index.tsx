import { QuestionTypeProps } from '../index';
import { useRef } from 'preact/compat';
import { useEffect, useState } from 'preact/hooks';
import { SpreadsheetEvaluator } from '../../../../lib/spreadsheetEvaluator';
import { createDataGrid } from '../../../../lib/grid';

/**
 * The Excel question component
 * @param {Object} question the excel question to display
 * @param {function} onChange called when the input is changed
 * @constructor
 */
export function ExcelQuestion({ question, onChange }: QuestionTypeProps) {
  const gridParent = useRef<any>();

  const data = question.options.data;

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
    evaluate.evaluate(data).then(() => {});

    grid.data = question.options.data;

    const formatHandler = (cell: any) => {
      const formula = cell.value;
      if (formula.toString().startsWith('=')) {
        try {
          cell.formattedValue = evaluate.get(cell.viewRowIndex, cell.viewColumnIndex)?.toString();
        } catch (e) {
          console.error('An error occurred', formula, e);
        }
      }
    };

    const changeHandler = (cell: any, newValue: any = cell.value) => {
      let value;
      value = Number.parseInt(newValue, 10);
      if (isNaN(value)) {
        value = cell.value;
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
    const editEndHandler = (event: any) => changeHandler(event.cell, event.value);
    const afterPasteHandler = (event: any) => setTimeout(
        () => event.cells.forEach(
            (cell: any) => {
              const c = grid.getVisibleCellByIndex(cell[1], cell[0]);
              changeHandler(c);
            },
        ),
        0,
    );

    grid.addEventListener('formattext', formatTextHandler);
    grid.addEventListener('endedit', editEndHandler);
    grid.addEventListener('afterpaste', afterPasteHandler);

    const gc = grid;
    return () => {
      gc.removeEventListener('formattext', formatHandler);
      gc.removeEventListener('endedit', editEndHandler);
      gc.removeEventListener('afterpaste', afterPasteHandler);
    };
  }, [data, grid, question, onChange]);

  return <div ref={gridParent} style={{ overflow: 'auto' }} />;
}
