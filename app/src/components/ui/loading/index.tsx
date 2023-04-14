import {
  Card,
  CardContent,
  CircularProgress,
  Container,
  Typography,
} from '@mui/material';

/**
 * A card with a loading spinner
 * @constructor
 */
export function Loading() {
  return <Container maxWidth="sm">
    <Card>
      <CardContent>
        <Typography variant="h5" component="div" align="center">
                    Loading
        </Typography>
        <Typography variant="body2" align="center">
          <CircularProgress size={100} />
        </Typography>
      </CardContent>
    </Card>
  </Container>;
}
