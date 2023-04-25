import Parse from 'parse/dist/parse.min.js';

Parse.initialize(
    import.meta.env.VITE_APP_ID || 'parse',
    import.meta.env.VITE_JS_KEY,
);
Parse.serverURL = import.meta.env.VITE_SERVER_URL || '/parse';

const SurveyObject = Parse.Object.extend('Survey');
const ParticipantObject = Parse.Object.extend('Participant');
const QuestionObject = Parse.Object.extend('Question');
const AnswerObject = Parse.Object.extend('Answer');
const AuthenticationObject = Parse.Object.extend('Authentication');

interface Survey {
    objectId: string;
    name: string;
    description?: string;
    authentication?: Authentication;
}

interface Participant {
    objectId: string;
    identifier: string;
}

interface Question {
    objectId: string;
    title: string;
    description?: string;
    type: string;
    options: any;
    page: number;
    required: boolean;
    timeLimit?: number
}

interface Authentication {
    objectId: string
    name: string
    type: string
    publicConfig: Record<string, any>
}

export { SurveyObject, ParticipantObject, QuestionObject, AnswerObject, AuthenticationObject };
export type { Survey, Participant, Question, Authentication };
export default Parse;
