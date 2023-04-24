import { Question, Survey } from '../../../lib/parse';
import { Alert, Typography } from '@mui/material';
import ExcelQuestion from './excel';
import TextQuestion from './text';
import SelectQuestion from './select';
import { useEffect, useState } from 'preact/hooks';
import Countdown from '../../ui/countdown';
import Markdown from 'markdown-to-jsx';
import MatrixQuestion from './matrix';

export interface QuestionProps {
    survey: Survey
    question: Question
    onChange: (obj: any) => void
}

export interface QuestionTypeProps {
    question: Question
    onChange: (obj: any) => void
}

const index: Record<string, (props: QuestionTypeProps) => JSX.Element> = {
  text: TextQuestion,
  select: SelectQuestion,
  excel: ExcelQuestion,
  matrix: MatrixQuestion,
};

/**
 * The component rendering the question
 * @param {Object} survey the survey the question is part of
 * @param {Object} question the question
 * @param {function} onChange called when the answer to the question is changed
 * @constructor
 */
export default function QuestionElem({ survey, question, onChange }: QuestionProps) {
  const [deadline, setDeadline] = useState<Date|undefined>();
  const [expired, setExpired] = useState(false);
  const elm = (index[question.type] ??
      (() => <>Unknown Question Type {question.type}</>))({ question, onChange });

  useEffect(() => {
    if (question.timeLimit) {
      setDeadline(new Date(new Date().getTime() + question.timeLimit * 1000));
      const timeout = setTimeout(() => {
        setExpired(true);
      }, question.timeLimit * 1000);
      return () => clearTimeout(timeout);
    }
  }, [question, setDeadline, setExpired]);

  const head = <>
    <Typography variant="h6" component="div">
      { question.title }
    </Typography>
    {(() => {
      if (deadline) {
        return <Typography variant="body2" component="p" align="right"><Countdown deadline={deadline} /> Bearbeitungszeit verbleidend</Typography>;
      }
    })()}
    <Typography variant="body2" component="div">
      <Markdown>{ (question.description ?? '').replace(/\\n/g, '\n') }</Markdown>
    </Typography>
  </>;

  if (expired) {
    return <>
      { head }
      <Alert severity="info">Zeit abgelaufen.</Alert>
    </>;
  }

  const body = <Typography variant="body2" component="div">
    { elm }
  </Typography>;

  return <>{head} {body}</>;
}
