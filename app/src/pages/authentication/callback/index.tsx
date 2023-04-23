import { useNavigate, useParams } from 'react-router-dom';
import Loading from '../../../components/ui/loading';
import { authenticationServices } from '../../../lib/authenticationServices';
import { useEffect } from 'preact/hooks';
import Parse, { AuthenticationObject } from '../../../lib/parse';

/**
 * Page component for handling authentication callbacks
 * @constructor
 */
export default function AuthenticationCallback() {
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      const query = new Parse.Query(AuthenticationObject);
      query.equalTo('objectId', id);
      const authentication = await query.first().then((auth) => auth?.toJSON() as any);
      if (!authentication) return;

      const params: Record<string, string> = {};

      for (const [key, value] of new URLSearchParams(window.location.search).entries()) {
        params[key] = value;
      }
      const surveyId = params['survey'];

      const participant = await authenticationServices[authentication.type]
          .callback(authentication, params);

      sessionStorage.setItem(`participant/${surveyId}`, JSON.stringify(participant));

      navigate(`/s/${surveyId}`);
    })();
  }, [id, navigate]);

  return <Loading />;
}
