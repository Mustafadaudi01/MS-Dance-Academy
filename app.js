const express = require("express");
const path = require("path");
const fs = require("fs");
const app = express();
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const cookie = require('cookie-parser');
const port = 3000;

// EXPRESS SPECIFIC STUFF
app.use('/static', express.static('static')); // For serving static files
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(bodyParser.json());

// PUG SPECIFIC STUFF
app.set('view engine', 'pug'); // Set the template engine as pug
app.set('views', path.join(__dirname, 'views')); // Set the views directory

// ENDPOINTS
app.get('/', (req, res) => {
  res.status(200).render('index.pug');
});

app.get("/contact", (req, res) => {
  res.status(200).render('contact.pug');
});
app.get("/classinfo", (req, res) => {
  res.status(200).render('class.pug');
});
app.get("/services", (req, res) => {
  res.status(200).render('services.pug');
});

app.post("/contact", (req, res) => {
  const { name, age, height, email, phone, textarea } = req.body; // Destructure form data

  // Log form data to backend console
  console.log(req.body);

  // Prepare content to write to file
  const outputtowrite = `My name is ${name}. My age is ${age}. My height is ${height}. My email address is ${email}. My phone number is ${phone}. And here are some details: ${textarea}`;

  // Write the content to 'output.txt'
  fs.writeFileSync('output.txt', outputtowrite);

  // Log success message
  console.log("File written successfully!");

  // Send response to the client
  res.status(200).send("Form submitted successfully!");
});

app.get('/login', (req, res) => {
  res.render('login.pug');
});

app.get('/signup', (req, res) => {
  res.render('signup.pug');
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  // Validate and authenticate user here
  res.send(`Welcome, ${username}`);
});
 
// MongoDB Connection
mongoose.connect('mongodb://localhost:27017/danceWebsiteDB', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB!'))
  .catch((err) => console.error('Error connecting to MongoDB:', err));

// Define User Schema and Model
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
});

const User = mongoose.model('User', userSchema);

// Routes
app.get('/', (req, res) => {
  res.status(200).render('home.pug');
});

app.get('/signup', (req, res) => {
  res.render('signup.pug');
});

app.post('/signup', async (req, res) => {
  const { name, email, password } = req.body;

  console.log("Request body received:", req.body);

  if (!name || !email || !password) {
    console.log("Validation failed: Missing fields");
    return res.status(400).send('All fields are required');
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({ name, email, password: hashedPassword });
    const savedUser = await newUser.save();

    console.log("User saved to database successfully:", savedUser);
    res.status(201).send('User registered successfully!');
  } catch (error) {
    console.error("Error saving user to database:", error);
    res.status(500).send('Error saving user: ' + error.message);
    res.render('home.pug');
  }
});

app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).send('Both email and password are required');
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).send('User not found');
    }

    // Compare the password with the hash
    const match = await bcrypt.compare(password, user.password);
    if (match) {
      res.status(200).send('Login successful!');
    } else {
      res.status(400).send('Invalid password');
    }
  } catch (error) {
    res.status(500).send('Error during login: ' + error.message);
  }
});

// START THE SERVER
app.listen(port, () => {
  console.log(`The application started successfully on port ${port}`);
});
