// give me some initial bunnys in the database
// which will make it easy to test my routes

// this file will be run with a script command in the terminal
// we will set that script command up in package.json
// the commant will be 'npm run seed'

const mongoose = require('mongoose')
const Bunny = require('./bunny')
const db = require('../../config/db')

const startBunnys = [
  { name: 'Sparky', type: 'bunny', age: 2, adoptable: true},
  { name: 'Leroy', type: 'bunny', age: 10, adoptable: true},
  { name: 'Biscuits', type: 'bunny', age: 3, adoptable: true},
  { name: 'Hulk Hogan', type: 'bunny', age: 1, adoptable: true}
]

// first, establish a connection to the db
// then remove all bunnys that got an owner
// then insert all teh starter bunnys from startbunnys array
// then most imprtantly close the conneciton to db

mongoose.connect(db, {useNewUrlParser:true})
  .then(() => {
    Bunny.deleteMany({owner: null })
      .then(deletedBunnys => {
        console.log('delted bunnys in seed script: ', deletedBunnys)

        Bunny.create(startBunnys)
          .then(newBunnys => {
            console.log('new bunnys added to db: /n', newBunnys)
            //VERY IMPORTANT
            mongoose.connection.close()
          })
          .catch(error => {
            console.log('an error has occurred: /n', error)
    
            //VERY IMPORTANT
            mongoose.connection.close()
          })
      })
      .catch(error => {
        console.log('an error has occurred: /n', error)

        //VERY IMPORTANT
        mongoose.connection.close()
      })
  })
  .catch(error => {
    console.log('an error has occurred: /n', error)

    //VERY IMPORTANT
    mongoose.connection.close()
  })
