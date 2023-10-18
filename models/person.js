const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const url = process.env.MONGODB_URI

console.log('connecting to', url)

mongoose.connect(url)
  .then(result => {
    console.log('connected to MongoDB')
  })
  .catch((error) => {
    console.log('error connecting to MongoDB:', error.message)
  })

//creamos el esquema
const personSchema = new mongoose.Schema({
    name: {
      type: String,
      required: true,
      unique: true,
      minlength: 3
    },
    number: {
      type: String,
      required: true,
      minlength: 8
    }
})

//aplicamos el plugin para validar el campo unique
personSchema.plugin(uniqueValidator);

personSchema.set('toJSON', {
    transform: (document, returnedObject) => {
      returnedObject.id = returnedObject._id.toString()
      delete returnedObject._id
      delete returnedObject.__v
    }
})

//creamos el modelo lo exportamos
module.exports = mongoose.model('Person', personSchema);
