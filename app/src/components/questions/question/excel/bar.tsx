import { Grid, IconButton, TextField } from '@mui/material';
import { useEffect, useState } from 'preact/hooks';
import CheckIcon from '@mui/icons-material/Check';
import ClearIcon from '@mui/icons-material/Clear';

export interface ExcelBarProps {
    defaultValue: string|undefined
    onChange: (value: string|undefined) => void
}

/**
 * The Excel bar component
 * @param {string} defaultValue the value to display in the bar
 * @param {function} onChange called when the user confirms a value change in the bar
 * @constructor
 */
export default function ExcelBar({ defaultValue, onChange }: ExcelBarProps) {
  const [value, setValue] = useState<string>();

  useEffect(() => {
    setValue(defaultValue);
  }, [defaultValue]);

  return <Grid container>
    <Grid item xs={9} sm={10} lg={11}>
      <TextField
        variant="outlined"
        size="small"
        margin="normal"
        fullWidth
        value={value}
        onChange={(e) => setValue(e.currentTarget.value)}
      />
    </Grid>
    <Grid item xs={3} sm={2} lg={1} style={{ paddingTop: '14px' }}>
      <IconButton aria-label="confirm input" onClick={() => onChange(value)}>
        <CheckIcon />
      </IconButton>
      <IconButton aria-label="reset input" onClick={() => setValue(defaultValue)}>
        <ClearIcon />
      </IconButton>
    </Grid>
  </Grid>;
}
