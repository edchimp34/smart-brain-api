const Clarifai = require('clarifai');

const app = new Clarifai.App({
  apiKey: '43240ebae95d4d4a9d17502618152316'
});

const handleApiCall = () => (req, res) => {
  app.models
    .predict(Clarifai.FACE_DETECT_MODEL, req.body.input)
    .then(data => {
      res.json(data);
    })
    .catch(err => res.status(400).json('unable to work with api'));

}

const handleImage = (db) => (req, res) => {
    const { id } = req.body;

    db('users').where({id}).increment({entries: 1}).returning('entries')
      .then(entries => {
          if (entries.length) {
            res.json(entries[0]);
          } else {
            res.status(400).json('no entries found');
          }
      })
      .catch(err => res.status(400).json('error updating entries'));
}

module.exports = {
    handleImage: handleImage,
    handleApiCall: handleApiCall
}