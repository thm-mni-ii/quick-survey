import { Survey } from '../../../lib/parse';
import { Card, CardContent, Container, Typography } from '@mui/material';

export interface SurveyEndProps {
    survey: Survey
}

/** *
 * The Card shown at the end of a survey
 * @param {Survey} survey the survey
 * @constructor
 */
export default function SurveyEnd({ survey }: SurveyEndProps) {
  return <Container maxWidth="xl">
    <Card>
      <CardContent>
        <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
                    Umfrage
        </Typography>
        <Typography variant="h4" component="div">
          { survey.name }
        </Typography>
        <Typography variant="body2">
                    Vielen Dank für ihre Teilnahme!
        </Typography>
      </CardContent>
    </Card>
  </Container>;
}
