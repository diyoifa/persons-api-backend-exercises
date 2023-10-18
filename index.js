require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const Person = require('./models/person');

const app = express();
app.use(express.json());
app.use(express.static('build'));
app.use(cors())

const errorHandler = (error,request,response,next)=>{
    console.log(error.message);
    if(error.name === 'CastError'){
        return response.status(400).send({error:'malformatted id'});
    }else if(error.name === 'ValidationError'){
        return response.status(400).send({error:error.message});
    }
    next(error);
}

morgan.token('post-data',(request)=>{
    if(request.method === 'POST'){
        return JSON.stringify(request.body);
    }
    return null;
})
app.use(morgan((tokens, req, res)=> {
    return [
      'Método:', tokens.method(req, res),
      'URL:', tokens.url(req, res),
      'Código de estado:', tokens.status(req, res),
      'Tiempo de respuesta:', tokens['response-time'](req, res), 'ms',
      'Datos POST:', tokens['post-data'](req, res), 
    ].join(' ');
  }));



app.get('/api/persons',(request,response, next)=>{
    Person.find({}).then(persons=>{
        persons.forEach(person=>{
            console.log(person);
        })
        if(persons){
            response.json(persons)

        }else{
            response.status(404).end();
        }
    }).catch(error=>{
        next(error);
    })
})

app.get('/api/persons/:id',(request, response, next)=>{
    const id = request.params.id;
    Person.findById(id).then(person=>{
        response.json(person);
    }).catch(error=>{
        next(error);
    })
})

app.post('/api/persons',(request,response, next)=>{
    const body = request.body;
    if(!body.name || !body.number){
        return response.status(400).json({
            error: 'name or number missing'
        })
    }
    const person = new Person({
        name: body.name,
        number: body.number,
    })
    person.save().then(savedPerson=>{
        response.json(savedPerson);
    }).catch(error=>{
        next(error);
    })
})

app.put('/api/persons/:id',(request,response,next)=>{

    const person = {
        name: request.body.name,
        number: request.body.number,
    }

    Person.findByIdAndUpdate(request.params.id, person,{new:true},  { runValidators: true, context: 'query' })
    .then(updatedPerson=>{
        response.json(updatedPerson);
    }).catch(error=>{
        next(error);
    })
})

app.delete('/api/persons/:id',(request,response, next)=>{
    Person.findByIdAndRemove(request.params.id).then(result=>{
        response.status(204).end();
    }).catch(error=>{
        next(error);
    })  
})


app.use(errorHandler)


//si el endpoint que llega es un recurso que no existe
app.use((request,response)=> response.status(404).send({error:'unknown endpoint'}));

const PORT = process.env.PORT || 3001;

app.listen(PORT, ()=>{
    console.log(`Server running on port ${PORT}`);
})








