import { QuestionTypeProps } from '../index';
import 'canvas-datagrid';
import { useRef } from 'preact/compat';
import { useEffect } from 'preact/hooks';
import { SpreadsheetEvaluator } from '../../../../lib/spreadsheetEvaluator';

/**
 * The Excel question component
 * @param {Object} question the excel question to display
 * @param {function} onChange called when the input is changed
 * @constructor
 */
export function ExcelQuestion({ question, onChange }: QuestionTypeProps) {
  const grid = useRef<any>();

  const data = question.options.data;

  useEffect(() => {
    const evaluate = new SpreadsheetEvaluator();
    evaluate.evaluate(data).then(() => {});

    grid.current.data = question.options.data;

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
        grid.current.gotoCell(event.cell.viewColumnIndex, event.cell.viewRowIndex);
        formatHandler(event);
      });
      onChange({ data });
    };

    grid.current.addEventListener('formattext', formatHandler);
    grid.current.addEventListener('endedit', editHandler);

    const gc = grid.current;
    return () => {
      gc.removeEventListener('formattext', formatHandler);
      gc.removeEventListener('endedit', editHandler);
    };
  }, [data, grid, question, onChange]);

  // @ts-ignore
  return <div style={{ overflow: 'auto' }}><canvas-datagrid ref={grid} /></div>;
}
