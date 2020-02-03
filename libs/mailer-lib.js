import axios from 'axios';

const apiKey = process.env.sendgridApiKey;

const instance = axios.create({
  baseURL: 'https://api.sendgrid.com/v3/mail/',
  headers: {
    "Content-Type": "application/json",
    "Authorization": "Bearer " + apiKey
  }
});

export const sendRoute = data => {
  const { email, firstName } = data;
  const templateId = getTemplateIdFromPlace('Zadomlya');

  var payload = {
    "template_id": templateId,
    "asm_group_id": "ID:12138",
    "personalizations": [
      {
        "to": [{ "email": email }],
        "dynamic_template_data": {
          "firstName": firstName,
        },
      }
    ], "from": { "email": "vipassana.minsk@gmail.com" }
  };

  return instance.post('send', payload);
};


function getTemplateIdFromPlace(place) {
  switch (place) {
    case 'Verasok':
      //   return 'd-fd62aa2a26c54467ae7a55e56437a906' // fix coordinates template
      return 'd-7b105bbe2b784e76b5fb3910c89b31bb'; // from sendgrid templates
    case 'Zadomlya':
      return 'd-af12de9614fb4b6da1c1ca30b37d516c';
    default:
      return false;
  }
}