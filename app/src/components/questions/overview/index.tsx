import {
  Card,
  CardActions,
  CardContent,
  Container,
  Typography,
} from '@mui/material';
import { Survey } from '../../../lib/parse';
import { useState } from 'preact/hooks';
import { LoadingButton } from '@mui/lab';
import Markdown from 'markdown-to-jsx';

interface SurveyOverviewProps {
    survey: Survey
    onStart: () => void
}

/**
 * The card shown at the start of a survey
 * @param {Object} survey the survey
 * @param {function} onStart called when the start button is clicked by the user
 * @constructor
 */
export default function SurveyOverview({ survey, onStart }: SurveyOverviewProps) {
  const [loading, setLoading] = useState(false);

  const startClick = () => {
    setLoading(true);
    onStart();
  };

  return <Container maxWidth="xl">
    <Card>
      <CardContent>
        <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
                    Umfrage
        </Typography>
        <Typography variant="h4" component="div">
          { survey.name }
        </Typography>
        <Typography variant="body2" color={ !survey.description ? 'text.secondary' : undefined }>
          <Markdown>{ (survey.description ?? 'No Description').replace(/\\n/g, '\n') }</Markdown>
        </Typography>
      </CardContent>
      <CardActions>
        <LoadingButton onClick={startClick} loading={loading}>Starten</LoadingButton>
      </CardActions>
    </Card>
  </Container>;
}
