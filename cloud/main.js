const seedrandom = require('seedrandom');

const umk = { useMasterKey: true }

const Survey = Parse.Object.extend("Survey");
const Participant = Parse.Object.extend("Participant");

// Prevent index queries by unauthenticated users
Parse.Cloud.beforeFind('Survey', async ({ query, user, master }) => {
    if (!user && !master && !query._where.objectId) {
      throw new Parse.Error(119, "OperationForbidden")
    }
})

// Prevent index queries by unauthenticated users
Parse.Cloud.beforeFind('Question', async ({ query, user, master, context }) => {
  if (master || user) return
  if (!query._where.survey || !query._where.page || !query._where.participantId) {
    throw new Parse.Error(119, "OperationForbidden")
  }
  const participantQuery = new Parse.Query(Participant)
  participantQuery.equalTo("identifier", query._where.participantId)
  const participant = await participantQuery.first(umk)
  if (!participant) {
    throw new Parse.Error(119, "OperationForbidden")
  }
  context.participantId = query._where.participantId
  delete query._where.participantId
  const surveyQuery = new Parse.Query(Survey)
  surveyQuery.equalTo("objectId", query._where.survey)
  const survey = await surveyQuery.first(umk)
  if (!isSurveyActive(survey)) {
    throw new Parse.Error(101, "ObjectNotFound")
  }
})

// Prevent returning non active surveys to unauthenticed users
Parse.Cloud.afterFind('Survey', async ({ objects, user, master }) => {
  if (master || user) return objects
  return objects.filter(isSurveyActive)
})

// Prevent returning non active surveys to unauthenticed users
Parse.Cloud.afterFind('Question', async ({ objects, user, master, context }) => {
  if (master || user) return objects
  const res = []

  const m = new Map()
  for (const object of objects) {
    const id = object.get('position')
    const current = m.get(id) ?? []
    current.push(object)
    m.set(id, current)
  }
  for (const [_, value] of m) {
    const first = value[0];
    const seed = `${first.get('survey').id}/${first.get('page')}/${first.get('position')}/${context.participantId}`;
    const rng = seedrandom(seed);
    const randomIndex = Math.floor(rng() * value.length);
    const randomElement = value[randomIndex];
    res.push(randomElement)
  }

  return res.sort(({position}) => position)
})

// Prevent answers for non active surverys and from wrong participants
Parse.Cloud.beforeSave('Answer', async ({ object, master }) => {
  if (master) return
  const question = await object.get('question').fetch(umk)
  const survey = await question.get('survey').fetch(umk)
  if (!isSurveyActive(survey)) {
    throw new Parse.Error(101, "ObjectNotFound")
  }
  const participant = await object.get('participant').fetch(umk)
  const givenId = object.get('participantId')
  object.unset('participantId')
  const realId = participant.get('identifier')
  if (givenId !== realId) {
    throw new Parse.Error(119, "OperationForbidden")
  }
})

function isSurveyActive (survey) {
  const now = new Date()
  const from = new Date(survey.get("activeFrom"))
  const to = new Date(survey.get("activeTo"))
  return from && from <= now && (!to || to > now)
}
