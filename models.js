const mongoose = require('mongoose');

const storySchema = mongoose.Schema({
  title: String,
  url: String,
  votes: {type: Number, default: 0}
});

storySchema.methods.apiRepr = function() {
  return  {
    id: this._id,
    title: this.title,
    url: this.url,
    votes: this.votes
  }
};

let Story = mongoose.model('Story', storySchema);

module.exports = {Story};
