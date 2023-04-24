import { QuestionTypeProps } from '../index';
import { Grid, Radio } from '@mui/material';
import { useEffect, useState } from 'preact/hooks';
import structuredClone from '@ungap/structured-clone';

/**
 * The matrix question component
 * @param {Object} question the matrix question to display
 * @param {function} onChange called when the input is changed
 * @constructor
 */
export default function MatrixQuestion({ question, onChange }: QuestionTypeProps) {
  const { items, levels } = question.options;
  const [selected, setSelected] = useState<number[]>([]);

  useEffect(() => {
    setSelected([]);
  }, [items, levels]);

  const updateSelected = (item: number, level: number) => {
    const newSelected = structuredClone(selected);
    newSelected[item] = level;
    setSelected(newSelected);
    if (newSelected.length === items.length) {
      onChange({ value: newSelected });
    }
  };

  const textAlignCenter = { textAlign: 'center' };

  return <Grid container direction="column" columns={items.length}>
    <Grid item xs={1}>
      <Grid container columns={levels.length+1}>
        <Grid item xs={1} />
        {levels.map((level: string, i: number) =>
          <Grid key={i} item xs={1} style={textAlignCenter}>
            {level}
          </Grid>,
        )}
      </Grid>
    </Grid>
    {items.map((item: string, i: number) => <Grid key={i} item xs={1}>
      <Grid container columns={levels.length+1}>
        <Grid item xs={1}>
          {item}
        </Grid>
        {levels.map((level: string, j: number) =>
          <Grid key={j} item xs={1} style={textAlignCenter}>
            <Radio
              checked={selected[i] === j}
              onChange={() => updateSelected(i, j)}
            />
          </Grid>,
        )}
      </Grid>
    </Grid>)}
  </Grid>;
}
