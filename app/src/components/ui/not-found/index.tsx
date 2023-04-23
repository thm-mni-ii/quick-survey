import { Card, CardContent, Container, Typography } from '@mui/material';

/**
 * A card containing a not found message
 * @constructor
 */
export default function NotFound() {
  return <Container maxWidth="sm">
    <Card>
      <CardContent>
        <Typography variant="h5" component="div" align="center">
                    404 Not Found
        </Typography>
        <Typography variant="body2" align="center">
                    Requested page not found.
        </Typography>
      </CardContent>
    </Card>
  </Container>;
}
