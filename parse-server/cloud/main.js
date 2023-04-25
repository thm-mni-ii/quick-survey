const seedrandom = require('seedrandom')
const { v4: uuidv4 } = require('uuid')

const umk = { useMasterKey: true }

const Survey = Parse.Object.extend("Survey")
const Participant = Parse.Object.extend("Participant")

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
    const first = value[0]
    const seed = `${first.get('survey').id}/${first.get('page')}/${first.get('position')}/${context.participantId}`
    const rng = seedrandom(seed)
    const randomIndex = Math.floor(rng() * value.length)
    const randomElement = value[randomIndex]
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

  if (
    givenId !== realId ||
    participant.get('survey').id !== survey.id
  ) {
    throw new Parse.Error(119, "OperationForbidden")
  }
})

// Prevent creation of participants for surveys requiring authentication
Parse.Cloud.beforeSave('Participant', async ({ object, master }) => {
  if (master) return
  const survey = await object.get('survey').fetch(umk)
  const authentication = survey.get('authentication')
  if (authentication) throw new Parse.Error(119, "OperationForbidden")
})

Parse.Cloud.define("loginCallback", async (request) => {
  const {authenticationId, parameters} = request.params

  const query = new Parse.Query("Authentication")
  query.equalTo("objectId", authenticationId)
  const authentication = await query.first(umk)

  const survey = { __type: 'Pointer', className: 'Survey', objectId: parameters.survey }

  const user = await validateLogin(authentication, parameters)

  const participant = new Participant()
  participant.set('survey', survey)
  participant.set('identifier', uuidv4())
  participant.set('authenticationInformation', {user})
  return participant.save(null, umk)
})

Parse.Cloud.define("cloneSurvey", async (request) => {
  if (!request.master) throw new Parse.Error(119, "OperationForbidden")
  const {id} = request.params

  const surveyQuery = new Parse.Query("Survey")
  surveyQuery.equalTo("objectId", id)
  const survey = await surveyQuery.first(umk)

  const newSurvey = await survey.clone().save(null, umk)
  
  const questionQuery = new Parse.Query("Question")
  questionQuery.equalTo("survey", id)
  const questions = await questionQuery.find(umk)

  for (const question of questions) {
    await question.clone().save({survey: newSurvey.toPointer()}, umk)
  }

  return newSurvey
})

async function validateLogin(authentication, parameters) {
  switch (authentication.get("type")) {
    case "cas":
      const config = await Parse.Config.get()
      const baseUrl = config.get("baseUrl")
      const {validationUrl} = authentication.get("privateConfig")
      const {ticket, survey} = parameters

      const res = await fetch(getValidationUrl(validationUrl, getServiceUrl(authentication.id, baseUrl, survey), ticket))
      if (res.status !== 200) {
        throw new Parse.Error(141, "ScriptFailed")
      }
      const body = await res.json()
      return body.serviceResponse.authenticationSuccess.user
    default:
      throw new Parse.Error(141, "ScriptFailed")
  }
}

function getServiceUrl(objectId, baseUrl, surveyId) {
  const serviceUrl = new URL(baseUrl)
  serviceUrl.pathname += `callback/${objectId}`
  serviceUrl.searchParams.set("survey", surveyId)
  return serviceUrl.toString()
}

function getValidationUrl(validationBaseUrl, serviceUrl, ticket) {
  const validationUrl = new URL(validationBaseUrl)
  validationUrl.searchParams.set('service', serviceUrl)
  validationUrl.searchParams.set('ticket', ticket)
  validationUrl.searchParams.set('format', 'json')
  return validationUrl.toString()
}

function isSurveyActive (survey) {
  const now = new Date()
  const from = new Date(survey.get("activeFrom"))
  const to = new Date(survey.get("activeTo"))
  return from && from <= now && (!to || to > now)
}
