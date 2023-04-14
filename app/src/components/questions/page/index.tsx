import { Question, Survey } from '../../../lib/parse';
import { useEffect, useState } from 'preact/hooks';
import {
  Alert,
  Card,
  CardActions,
  CardContent,
  Container,
  Divider,
  Typography,
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import QuestionElem from '../question';

export interface QuestionPageProps {
    survey: Survey
    page: number
    questions: Question[]
    onNext: (answers: Record<string, any>) => void
}

/**
 * The Card component containing a page of the survey
 * @param {Object} survey the survey
 * @param {number} page the number of the page to display
 * @param {Array} questions a list of questions to display
 * @param {function} onNext called when the next button is pressed
 * @constructor
 */
export default function QuestionPage({ survey, page, questions, onNext }: QuestionPageProps) {
  const [loading, setLoading] = useState(false);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [missing, setMissing] = useState(false);

  const nextClick = () => {
    setLoading(true);
    for (const [questionId, answer] of Object.entries(answers)) {
      const question = questions.find((q) => questionId === q.objectId);
      if (question?.required && !answer) {
        setMissing(true);
        setLoading(false);
        return;
      }
    }
    onNext(answers);
  };

  const updateAnswer = (question: Question, answer: any) => {
    answers[question.objectId] = answer;
    setAnswers(answers);
  };

  useEffect(() => {
    const answers: Record<string, any> = {};
    for (const question of questions) {
      answers[question.objectId] = undefined;
    }

    setLoading(false);
    setAnswers(answers);
    setMissing(false);
  }, [questions, setLoading, setAnswers, setMissing]);

  return <Container maxWidth="xl">
    <Card>
      <CardContent>
        <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
                    Umfrage
        </Typography>
        <Typography variant="h4" component="div">
          { survey.name }
        </Typography>
        <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
                    Seite {page}
        </Typography>
        <Divider />
        {questions.map((question) => <div key={question.objectId} ><QuestionElem
          survey={survey}
          question={question}
          onChange={(answer) => updateAnswer(question, answer)}
        /><Divider /></div>)}
        {(() => {
          if (missing) {
            return <Alert severity="error" style={{ marginTop: '10px' }}>Bitte füllen Sie alle pflicht Felder aus.</Alert>;
          }
        })()}
      </CardContent>
      <CardActions>
        <LoadingButton onClick={nextClick} loading={loading}>Weiter</LoadingButton>
      </CardActions>
    </Card>
  </Container>;
}
