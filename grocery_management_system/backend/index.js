require('dotenv').config();
const port = 5000;
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const multer = require("multer");
const path = require("path");
const cors = require("cors");

const allowedOrigins = [
    'https://grocery-management-system-jtpg.onrender.com',
    ...Array.from({ length: 65535 }, (_, i) => `http://localhost:${i + 1}`)
];

const corsOptions = {
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    }
};

app.use(express.json());
app.use(cors(corsOptions));

mongoose.connect(process.env.MONGODB_URL, {
    serverSelectionTimeoutMS: 50000
})
    .then(() => console.log("Database connected successfully"))
    .catch(err => console.error("Database connection error:", err));

app.use('/images', express.static('upload/images'));

const storage = multer.diskStorage({
    destination: './upload/images',
    filename: (req, file, cb) => {
        return cb(null, `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`);
    }
});

app.get("/", (req, res) => {
    res.send("Express app is running");
});

const upload = multer({ storage: storage });

app.post("/upload", upload.single('product'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ success: false, message: "No file uploaded" });
    }
    res.json({
        success: true,
        image_url: `http://localhost:${port}/images/${req.file.filename}`
    });
});

const Product = mongoose.model("Product", {
    name: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true,
    },
    pricePerUnit: {
        type: Number,
        required: true
    },
    size: {
        type: Number, // The size can be stored as a number corresponding to the L/m value
        required: true
    },
    date: {
        type: Date,
        default: Date.now,
    }
});

app.post('/addproduct', async (req, res) => {
    try {
        const { name, image, category, pricePerUnit, size } = req.body;
        if (!name || !image || !category || !pricePerUnit || !size) {
            return res.status(400).json({ success: false, message: "All fields are required" });
        }

        // Ensure category is either 'pipes' or 'tanks'
        if (!['pipes', 'tanks'].includes(category)) {
            return res.status(400).json({ success: false, message: "Invalid category. Choose either 'pipes' or 'tanks'" });
        }

        const newProduct = new Product({
            name,
            image,
            category,
            pricePerUnit,
            size,
        });

        await newProduct.save();
        res.json({
            success: true,
            product: newProduct,
        });
    } catch (err) {
        console.error("Error saving product:", err);
        res.status(500).json({ success: false, message: "Internal Server Error", error: err.message });
    }
});

const Users = mongoose.model('Users', {
    name: {
        type: String,
    },
    email: {
        type: String,
        unique: true,
    },
    password: {
        type: String,
    },
    date: {
        type: Date,
        default: Date.now,
    }
});

app.post('/signup', async (req, res) => {
    try {
        let check = await Users.findOne({ email: req.body.email });
        if (check) {
            return res.status(400).json({ success: false, message: 'User already exists' });
        }

        const user = new Users({
            name: req.body.name,
            email: req.body.email,
            password: req.body.password,
        });

        await user.save();

        const data = {
            user: {
                id: user.id,
            },
        };

        const token = jwt.sign(data, 'secret_ecom');
        res.json({ success: true, token });
    } catch (err) {
        console.error('Error during signup:', err);
        res.status(500).json({ success: false, message: 'Internal Server Error', error: err.message });
    }
});

app.post('/login', async (req, res) => {
    try {
        let user = await Users.findOne({ email: req.body.email });
        if (user && req.body.password === user.password) {
            const data = { user: { id: user.id } };
            const token = jwt.sign(data, 'secret_ecom');
            res.json({ success: true, token });
        } else {
            res.json({ success: false, message: "Incorrect email or password" });
        }
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});

app.post('/removeproduct', async (req, res) => {
    try {
        const deletedProduct = await Product.findOneAndDelete({ _id: req.body.id });
        if (!deletedProduct) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }
        res.json({
            success: true,
            message: "Product removed successfully"
        });
    } catch (err) {
        console.error("Error removing product:", err);
        res.status(500).json({ success: false, message: "Internal Server Error", error: err.message });
    }
});

app.post('/updateproduct', async (req, res) => {
    try {
        const { id, name, pricePerUnit, category, size } = req.body;
        if (!id || !name || !pricePerUnit || !category || !size) {
            return res.status(400).json({ success: false, message: "All fields are required" });
        }

        // Ensure category is either 'pipes' or 'tanks'
        if (!['pipes', 'tanks'].includes(category)) {
            return res.status(400).json({ success: false, message: "Invalid category. Choose either 'pipes' or 'tanks'" });
        }

        const updatedProduct = await Product.findOneAndUpdate(
            { _id: id },
            { name, pricePerUnit, category, size },
            { new: true }
        );
        if (!updatedProduct) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }
        res.json({ success: true, updatedProduct });
    } catch (err) {
        console.error("Error updating product:", err);
        res.status(500).json({ success: false, message: "Internal Server Error", error: err.message });
    }
});

app.get('/allproducts', async (req, res) => {
    try {
        const { category } = req.query;
        let query = {};

        // Filter by category if provided
        if (category && category !== 'all') {
            if (!['pipes', 'tanks'].includes(category)) {
                return res.status(400).json({ success: false, message: "Invalid category. Choose either 'pipes' or 'tanks'" });
            }
            query.category = category;
        }

        const products = await Product.find(query);
        res.json(products);
    } catch (err) {
        console.error("Error fetching products:", err);
        res.status(500).json({ success: false, message: "Internal Server Error", error: err.message });
    }
});

const Employee = mongoose.model("Employee", {
    name: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: true
    },
    position: {
        type: String,
        required: true
    },
    department: {
        type: String,
        required: true,
        enum: ['sales', 'production', 'logistics', 'finance', 'hr']
    },
    salary: {
        type: Number,
        required: true
    },
    joinDate: {
        type: Date,
        required: true
    },
    email: {
        type: String
    },
    phone: {
        type: String
    },
    date: {
        type: Date,
        default: Date.now
    }
});

// Add Employee Route
app.post('/addemployee', upload.single('image'), async (req, res) => {
    try {
        const { name, position, department, salary, joinDate, email, phone } = req.body;

        // Validate required fields
        if (!name || !position || !department || !salary || !joinDate || !req.file) {
            return res.status(400).json({ success: false, message: "Required fields are missing" });
        }

        // Validate department
        if (!['sales', 'production', 'logistics', 'finance', 'hr'].includes(department)) {
            return res.status(400).json({ success: false, message: "Invalid department" });
        }

        const image_url = `http://localhost:5000/uploads/${req.file.filename}`;

        const newEmployee = new Employee({
            name,
            image: image_url,
            position,
            department,
            salary,
            joinDate,
            email,
            phone
        });

        await newEmployee.save();

        res.json({
            success: true,
            employee: newEmployee
        });
    } catch (err) {
        console.error("Error saving employee:", err);
        res.status(500).json({ success: false, message: "Internal Server Error", error: err.message });
    }
});
// Get All Employees Route
app.get('/allemployees', async (req, res) => {
    try {
        const { department } = req.query;
        let query = {};

        // Filter by department if provided
        if (department && department !== 'all') {
            if (!['sales', 'production', 'logistics', 'finance', 'hr'].includes(department)) {
                return res.status(400).json({ success: false, message: "Invalid department" });
            }
            query.department = department;
        }

        const employees = await Employee.find(query);
        res.json(employees);
    } catch (err) {
        console.error("Error fetching employees:", err);
        res.status(500).json({ success: false, message: "Internal Server Error", error: err.message });
    }
});

// Remove Employee Route
app.post('/removeemployee', async (req, res) => {
    try {
        const deletedEmployee = await Employee.findOneAndDelete({ _id: req.body.id });
        if (!deletedEmployee) {
            return res.status(404).json({ success: false, message: "Employee not found" });
        }
        res.json({
            success: true,
            message: "Employee removed successfully"
        });
    } catch (err) {
        console.error("Error removing employee:", err);
        res.status(500).json({ success: false, message: "Internal Server Error", error: err.message });
    }
});

// Update Employee Route
app.post('/updateemployee', async (req, res) => {
    try {
        const { id, name, position, department, salary, joinDate, email, phone } = req.body;
        
        // Validate required fields
        if (!id || !name || !position || !department || !salary || !joinDate) {
            return res.status(400).json({ success: false, message: "Required fields are missing" });
        }

        // Validate department
        if (!['sales', 'production', 'logistics', 'finance', 'hr'].includes(department)) {
            return res.status(400).json({ success: false, message: "Invalid department" });
        }

        const updatedEmployee = await Employee.findOneAndUpdate(
            { _id: id },
            { name, position, department, salary, joinDate, email, phone },
            { new: true }
        );
        
        if (!updatedEmployee) {
            return res.status(404).json({ success: false, message: "Employee not found" });
        }
        
        res.json({ 
            success: true, 
            employee: updatedEmployee 
        });
    } catch (err) {
        console.error("Error updating employee:", err);
        res.status(500).json({ success: false, message: "Internal Server Error", error: err.message });
    }
});

// Get Employee by ID Route
app.get('/employee/:id', async (req, res) => {
    try {
        const employee = await Employee.findById(req.params.id);
        
        if (!employee) {
            return res.status(404).json({ success: false, message: "Employee not found" });
        }
        
        res.json(employee);
    } catch (err) {
        console.error("Error fetching employee:", err);
        res.status(500).json({ success: false, message: "Internal Server Error", error: err.message });
    }
});

// Get Employee Statistics Route
app.get('/employee-stats', async (req, res) => {
    try {
        // Count total employees
        const totalEmployees = await Employee.countDocuments();
        
        // Count employees by department
        const departmentCounts = await Employee.aggregate([
            { $group: { _id: "$department", count: { $sum: 1 } } }
        ]);
        
        // Get salary statistics
        const salaryStats = await Employee.aggregate([
            {
                $group: {
                    _id: null,
                    avgSalary: { $avg: "$salary" },
                    minSalary: { $min: "$salary" },
                    maxSalary: { $max: "$salary" },
                    totalSalary: { $sum: "$salary" }
                }
            }
        ]);
        
        // Get recently joined employees (last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        const recentJoins = await Employee.countDocuments({
            joinDate: { $gte: thirtyDaysAgo }
        });
        
        res.json({
            success: true,
            stats: {
                totalEmployees,
                departmentBreakdown: departmentCounts,
                salaryStatistics: salaryStats[0] || {},
                recentJoins
            }
        });
    } catch (err) {
        console.error("Error getting employee statistics:", err);
        res.status(500).json({ success: false, message: "Internal Server Error", error: err.message });
    }
});

// Search Employees Route
app.get('/search-employees', async (req, res) => {
    try {
        const { query } = req.query;
        
        if (!query) {
            return res.status(400).json({ success: false, message: "Search query is required" });
        }
        
        const employees = await Employee.find({
            $or: [
                { name: { $regex: query, $options: 'i' } },
                { position: { $regex: query, $options: 'i' } },
                { department: { $regex: query, $options: 'i' } },
                { email: { $regex: query, $options: 'i' } }
            ]
        });
        
        res.json(employees);
    } catch (err) {
        console.error("Error searching employees:", err);
        res.status(500).json({ success: false, message: "Internal Server Error", error: err.message });
    }
});

app.post('/analyze-sentiment', async (req, res) => {
    const { text } = req.body;

    try {
        const response = await fetch('https://api-inference.huggingface.co/models/distilbert-base-uncased-finetuned-sst-2-english', {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer KEY',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ inputs: text }),
        });

        const result = await response.json();
        console.log(result);
        
        // Return only one response
        res.json({
            sentiment: result[0][0].label,
            score: result[0][0].score
        });

    } catch (error) {
        console.error("Sentiment analysis error:", error);
        if (!res.headersSent) {
            res.status(500).json({ message: "Failed to analyze sentiment" });
        }
    }
});

const feedbackSchema = new mongoose.Schema({
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product'},
    text: { type: String, required: true },
    sentiment: { type: String, required: true },
    score: { type: Number, required: true },
    timestamp: { type: Date, default: Date.now },
  });
  const Feedback = mongoose.model('Feedback', feedbackSchema);
  
  // Feedback submission route
  app.post('/submit-feedback', async (req, res) => {
    try {
      const { productId, text, sentiment, score } = req.body;
  
      const newFeedback = await Feedback.create({ productId, text, sentiment, score });
  
      res.status(200).json({ message: 'Feedback submitted successfully', feedback: newFeedback });
    } catch (error) {
      console.error('Error saving feedback:', error);
      res.status(500).json({ message: 'Failed to save feedback' });
    }
  });
  
  // Route to get all feedbacks (for admin)
  app.get('/get-feedbacks', async (req, res) => {
    try {
      const feedbacks = await Feedback.find()
        .populate('productId', 'name') // only populate product name
        .sort({ timestamp: -1 });
  
      res.json(feedbacks);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch feedbacks' });
    }
  });
  
  
app.listen(port, (error) => {
    if (!error) {
        console.log("Server running on port " + port);
    } else {
        console.log("Server connection error: " + error);
    }
});
