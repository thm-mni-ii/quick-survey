import { Authentication, Survey } from '../../../lib/parse';
import { Card, CardActions, CardContent, Container, Typography } from '@mui/material';
import { authenticationServices } from '../../../lib/authenticationServices';
import { LoadingButton } from '@mui/lab';
import { useState } from 'preact/hooks';

export interface CasLoginButtonProps {
    authentication: Authentication
    survey: Survey
}

/**
 * A component containing a card asking the user to authenticate using the given method for the given survey
 * @param {Object} authentication the authentication method to use
 * @param {Object} survey the survey to authenticate for
 * @constructor
 */
export default function SurveyLogin({ authentication, survey }: CasLoginButtonProps) {
  const [loading, setLoading] = useState(false);

  const login = async () => {
    setLoading(true);
    const url = await authenticationServices[authentication.type]
        .getUrl(authentication, survey.objectId);
    window.location.assign(url);
  };

  return <Container maxWidth="xl">
    <Card>
      <CardContent>
        <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
                    Umfrage Login
        </Typography>
        <Typography variant="h4" component="div">
          { survey.name }
        </Typography>
        <Typography variant="body2" color={ !survey.description ? 'text.secondary' : undefined }>
                    Für die Teilnahme an dieser Umfrage ist eine Anmeldung erforderlich.
        </Typography>
      </CardContent>
      <CardActions>
        <LoadingButton onClick={login} loading={loading}>{authentication.name} Login</LoadingButton>
      </CardActions>
    </Card>
  </Container>;
}
