import { useState, useEffect, useCallback } from 'preact/hooks';

import Parse, {
  AnswerObject,
  Participant,
  ParticipantObject,
  Question,
  QuestionObject,
  Survey,
  SurveyObject,
} from '../../lib/parse';
import { useParams } from 'react-router-dom';
import { Loading } from '../../components/ui/loading';
import SurveyOverview from '../../components/questions/overview';
import { setNoNavigate } from '../../lib/no-navigate';
import { v4 as uuidv4 } from 'uuid';
import QuestionPage from '../../components/questions/page';
import SurveyEnd from '../../components/questions/end';
import { NotFound } from '../../components/ui/not-found';

/**
 * The survey page
 * @constructor
 */
export default function SurveyPage() {
  const { id } = useParams();

  const [survey, setSurvey] = useState<Survey>();
  const [participant, setParticipant] = useState<Participant>();
  const [questions, setQuestions] = useState<Question[]>();
  const [page, setPage] = useState<number>(1);
  const [notFound, setNotFound] = useState<boolean>(false);

  const loadSurvey = useCallback(async () => {
    const query = new Parse.Query(SurveyObject);
    query.equalTo('objectId', id);

    const survey = await query.first();
    if (!survey) {
      setNotFound(true);
    }
    setSurvey(survey?.toJSON() as any);
  }, [id, setNotFound, setSurvey]);

  const startSurvey = async () => {
    setNoNavigate(true);
    const participant = new ParticipantObject();
    participant.set('identifier', uuidv4());
    const savedParticipant = await participant.save();
    const p = savedParticipant.toJSON() as any;
    setParticipant(p);
    await loadQuestions(1, p);
  };

  const loadQuestions = async (page: number, participant: Participant) => {
    setPage(page);
    const query = new Parse.Query(QuestionObject);
    query.equalTo('survey', survey?.objectId);
    query.equalTo('page', page.toString());
    query.equalTo('participantId', participant?.identifier);
    const questions = await query.find();
    setQuestions(questions.map((question) => question.toJSON() as any));
  };

  const next = async (answers: Record<string, any>) => {
    for (const [id, answer] of Object.entries(answers)) {
      if (!answer) continue;
      const ao = new AnswerObject();

      ao.set('question', { __type: 'Pointer', className: 'Question', objectId: id });
      ao.set('participant', { __type: 'Pointer', className: 'Participant', objectId: participant!!.objectId });
      ao.set('answer', answer);
      ao.set('participantId', participant!!.identifier);
      await ao.save();
    }
    await loadQuestions(page+1, participant!!);
  };

  useEffect(() => {
    void loadSurvey();
    return () => {};
  }, [loadSurvey]);

  if (notFound) {
    return <NotFound />;
  }

  if (!survey) {
    return <Loading />;
  }

  if (!questions) {
    return <SurveyOverview survey={survey} onStart={startSurvey} />;
  }

  if (questions.length === 0) {
    setNoNavigate(false);
    return <SurveyEnd survey={survey} />;
  }

  return <QuestionPage survey={survey} page={page} questions={questions} onNext={next} />;
}
