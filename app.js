const express = require('express');
const app = express();
const port = 3000;

const { MongoClient, ObjectId } = require('mongodb');

const uri = 'mongodb+srv://iansma:Misasa08@cluster0.foxmga8.mongodb.net/?retryWrites=true&w=majority';
const client = new MongoClient(uri);

let cardsCollection;

app.use(express.static('public'));
app.use(express.json());

async function connectToDatabase() {
  try {
    await client.connect();
    console.log('Conexión a MongoDB Atlas establecida');
    const db = client.db('mydatabase'); 
    cardsCollection = db.collection('cards');
  } catch (error) {
    console.error('Error al conectar con MongoDB Atlas', error);
  }
}

connectToDatabase().catch(console.error);



app.post('/api/cards', async (req, res) => {
  const newCard = req.body;
  try {
    const result = await cardsCollection.insertOne(newCard);
    res.json({ message: 'Carta registrada exitosamente', cardId: result.insertedId });
  } catch (error) {
    console.error('Error al agregar la carta', error);
    res.status(500).json({ message: 'Error al agregar la carta' });
  }
});

app.get('/api/cards', async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 5;
  const sortBy = req.query.sortBy || 'cardName';
  const sortOrder = req.query.sortOrder === 'desc' ? -1 : 1;


  const cardType = req.query.cardType || '';


  try {

    const filter = {};
    if (cardType !== '') {
      filter.cardType = cardType;
    }
   

    const totalCards = await cardsCollection.countDocuments(filter);
    const totalPages = Math.ceil(totalCards / limit);
    const skip = (page - 1) * limit;

 
    const sortOptions = { [sortBy]: sortOrder };

    const cards = await cardsCollection.find(filter).sort(sortOptions).skip(skip).limit(limit).toArray();

    res.json({ cards, totalPages, currentPage: page });
  } catch (error) {
    console.error('Error al obtener las cartas', error);
    res.status(500).json({ message: 'Error al obtener las cartas' });
  }
});

app.get('/api/cards/search', async (req, res) => {
  const searchTerm = req.query.term;

  try {
 
    const searchResult = await cardsCollection.find({
      $or: [
        { cardName: { $regex: searchTerm, $options: 'i' } }, // Buscar por nombre (ignorando mayúsculas y minúsculas)
        { cardType: { $regex: searchTerm, $options: 'i' } } // Buscar por tipo (ignorando mayúsculas y minúsculas)
      ]
    }).toArray();

    res.json(searchResult);
  } catch (error) {
    console.error('Error al buscar cartas', error);
    res.status(500).json({ message: 'Error al buscar cartas' });
  }
});

app.get('/api/cards/:id', async (req, res) => {
  const cardId = req.params.id;

  try {
    const card = await cardsCollection.findOne({ _id: new ObjectId(cardId) }); // Usa 'new' con ObjectId
    if (!card) {
      res.status(404).json({ message: 'Carta no encontrada' });
    } else {
      res.json(card);
    }
  } catch (error) {
    console.error('Error al obtener la carta', error);
    res.status(500).json({ message: 'Error al obtener la carta' });
  }
});

app.put('/api/cards/:id', async (req, res) => {
  const cardId = req.params.id;
  const updatedCard = req.body;

  try {
    const result = await cardsCollection.updateOne(
      { _id: new ObjectId(cardId) }, // Convertir el id a ObjectId
      { $set: updatedCard }
    );

    if (result.modifiedCount === 0) {
      res.status(404).json({ message: 'Carta no encontrada' });
    } else {
      res.json({ message: 'Carta actualizada exitosamente' });
    }
  } catch (error) {
    console.error('Error al actualizar la carta', error);
    res.status(500).json({ message: 'Error al actualizar la carta' });
  }
});

app.delete('/api/cards/:id', async (req, res) => {
  const cardId = req.params.id;

  try {
    const result = await cardsCollection.deleteOne({ _id: new ObjectId(cardId) }); // Usa 'new' con ObjectId

    if (result.deletedCount === 0) {
      res.status(404).json({ message: 'Carta no encontrada' });
    } else {
      res.json({ message: 'Carta eliminada exitosamente' });
    }
  } catch (error) {
    console.error('Error al eliminar la carta', error);
    res.status(500).json({ message: 'Error al eliminar la carta' });
  }
});

app.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
});