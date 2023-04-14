import { QuestionTypeProps } from '../index';
import 'canvas-datagrid';
import { useRef } from 'preact/compat';
import { useEffect } from 'preact/hooks';
import buildParser from '../../../../lib/parser';

/**
 * The Excel question component
 * @param {Object} question the excel question to display
 * @param {function} onChange called when the input is changed
 * @constructor
 */
export function ExcelQuestion({ question, onChange }: QuestionTypeProps) {
  const grid = useRef<any>();

  const data = question.options.data;
  const parser = buildParser(data);

  useEffect(() => {
    grid.current.data = question.options.data;

    const formatHandler = (event: any) => {
      const formula = event.cell.value;
      if (formula.toString().startsWith('=')) {
        try {
          const parsed = parser.parse(formula.toString().slice(1));
          event.cell.formattedValue = parsed.toString();
        } catch (e) {
          console.error('An error occurred', formula, e);
        }
      }
    };

    const editHandler = (event: any) => {
      if (!event.cell.viewRowIndex || !event.cell.viewColumnIndex) return;
      let value;
      value = Number.parseInt(event.value, 10);
      if (isNaN(value)) {
        value = event.value;
      }
      data[event.cell.viewRowIndex][event.cell.viewColumnIndex] = value;
      onChange({ data });
    };

    grid.current.addEventListener('formattext', formatHandler);
    grid.current.addEventListener('endedit', editHandler);

    const gc = grid.current;
    return () => {
      gc.removeEventListener('formattext', formatHandler);
      gc.removeEventListener('endedit', editHandler);
    };
  }, [data, grid, question, onChange, parser]);

  // @ts-ignore
  return <div style={{ overflow: 'auto' }}><canvas-datagrid ref={grid} /></div>;
}
