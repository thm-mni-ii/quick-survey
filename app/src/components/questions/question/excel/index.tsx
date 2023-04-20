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
      setGrid(undefined);
    };
  }, []);

  useEffect(() => {
    if (!grid) return;
    const evaluate = new SpreadsheetEvaluator();
    evaluate.evaluate(data).then(() => {});

    grid.data = question.options.data;

    const formatHandler = async (event: any) => {
      const formula = event.cell.value;
      if (formula.toString().startsWith('=')) {
        try {
          event.cell.formattedValue = evaluate.get(event.cell.viewRowIndex, event.cell.viewColumnIndex)?.toString();
        } catch (e) {
          console.error('An error occurred', formula, e);
        }
      }
    };

    const editHandler = async (event: any) => {
      let value;
      value = Number.parseInt(event.value, 10);
      if (isNaN(value)) {
        value = event.value;
      }
      data[event.cell.viewRowIndex][event.cell.viewColumnIndex] = value;
      evaluate.evaluate(data).then(() => {
        grid.gotoCell(event.cell.viewColumnIndex, event.cell.viewRowIndex);
        formatHandler(event);
      });
      onChange({ data });
    };

    grid.addEventListener('formattext', formatHandler);
    grid.addEventListener('endedit', editHandler);

    const gc = grid;
    return () => {
      gc.removeEventListener('formattext', formatHandler);
      gc.removeEventListener('endedit', editHandler);
    };
  }, [data, grid, question, onChange]);

  return <div ref={gridParent} style={{ overflow: 'auto' }} />;
}
