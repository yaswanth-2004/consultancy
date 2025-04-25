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

app.listen(port, (error) => {
    if (!error) {
        console.log("Server running on port " + port);
    } else {
        console.log("Server connection error: " + error);
    }
});
