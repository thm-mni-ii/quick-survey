import { QuestionTypeProps } from '../index';
import { FormControl, InputLabel, MenuItem, Select } from '@mui/material';
import { useMemo } from 'preact/compat';

/**
 * The select question component
 * @param {Object} question the select question to display
 * @param {function} onChange called when the input is changed
 * @constructor
 */
export default function SelectQuestion({ question, onChange }: QuestionTypeProps) {
  const items = useMemo(() => question.options.items, [question]);

  return <FormControl size="small" margin="normal" fullWidth required={question.required}>
    <InputLabel>{question.options.label}</InputLabel>
    <Select
      defaultValue={question.options.default ?? ''}
      label={question.options.label}
      onChange={(e: any) => onChange({ value: e.target.value })}
    >
      {(() => items.map((item: any) => <MenuItem key={item.value} value={item.value}>{item.label}</MenuItem>))()}
    </Select>
  </FormControl>;
}
