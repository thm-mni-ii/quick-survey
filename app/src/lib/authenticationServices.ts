import Parse, { Authentication, Participant } from './parse';

/**
 * Abstract class representing an authentication method
 */
abstract class AuthenticationService {
    /**
     * Get the authentication url
     * @param {Object} authentication the authentication method
     * @param {string} surveyId the id survey to authenticate
     * @return {Promise<string>} the authentication url
     */
    abstract getUrl(authentication: Authentication, surveyId: string): Promise<string>

    /**
     * Handle an authentication callback
     * @param {Object} authentication thew authentication method
     * @param parameters the callback parameters
     * @return {Promise<Object>} the authenticated participant
     */
    abstract callback(authentication: Authentication, parameters: Record<string, string>): Promise<Participant>
}

/**
 * Implementation of AuthenticationService for CAS
 */
class CasAuthenticationService extends AuthenticationService {
  /**
   * @inheritDoc
   */
  async getUrl(authentication: Authentication, surveyId: string): Promise<string> {
    const url = new URL(authentication.publicConfig.loginUrl);
    const config = await Parse.Config.get();

    const serviceUrl = new URL(config.get('baseUrl'));
    serviceUrl.pathname += `callback/${authentication.objectId}`;
    serviceUrl.searchParams.set('survey', surveyId);

    url.searchParams.set('service', serviceUrl.toString());
    return url.toString();
  }

  /**
   * @inheritDoc
   */
  async callback(authentication: Authentication, parameters: Record<string, string>): Promise<Participant> {
    const res = await Parse.Cloud.run('loginCallback', { authenticationId: authentication.objectId, parameters });
    return res.toJSON();
  }
}

const authenticationServices: Record<string, AuthenticationService> = { cas: new CasAuthenticationService() };

export { authenticationServices, AuthenticationService, CasAuthenticationService };
