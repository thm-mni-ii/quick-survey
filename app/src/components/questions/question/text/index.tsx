import { QuestionTypeProps } from '../index';
import { TextField } from '@mui/material';

/**
 * The text question component
 * @param {Object} question the text question to display
 * @param {function} onChange called when the input is changed
 * @constructor
 */
export function TextQuestion({ question, onChange }: QuestionTypeProps) {
  return <TextField
    variant="outlined"
    size="small"
    label={question.options.label}
    onChange={(e) => onChange({ value: e.currentTarget.value })}
    margin="normal"
    fullWidth
    required={question.required}
  />;
}
