const Vendor = require('../models/Vendor');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt'); 
const dotEnv = require('dotenv');

dotEnv.config();

const secretKey = process.env.WhatIsYourName || "default_secret_key"; // Fallback in case .env variable is missing

const vendorRegister = async (req, res) => {
    try {
        const { username, email, password } = req.body;

       
        if (!username || !email || !password) {
            return res.status(400).json({ error: "All fields (username, email, password) are required" });
        }

        
        if (typeof password !== 'string') {
            return res.status(400).json({ error: "Password must be a string" });
        }

       
        const vendorEmail = await Vendor.findOne({ email });
        if (vendorEmail) {
            return res.status(400).json({ error: "Email already taken" });
        }

        
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newVendor = new Vendor({
            username,
            email,
            password: hashedPassword
        });

        await newVendor.save();

        res.status(201).json({ message: "Vendor registered successfully" });
        console.log("Vendor registered successfully");

    } catch (error) {
        console.error("Error in vendorRegister:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

const vendorLogin = async (req, res) => {
    try {
        const { email, password } = req.body;

        
        if (!email || !password) {
            return res.status(400).json({ error: "Email and password are required" });
        }

        const vendor = await Vendor.findOne({ email });

        
        if (!vendor || !(await bcrypt.compare(password, vendor.password))) {
            return res.status(401).json({ error: "Invalid username or password" });
        }

        
        const token = jwt.sign({ vendorId: vendor._id }, secretKey, { expiresIn: "1h" });

        res.status(200).json({ success: "Login successful", token, vendorId: vendor._id });
        console.log(email, "this is token", token);

    } catch (error) {
        console.error("Error in vendorLogin:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

const getAllVendors = async (req, res) => {
    try {
        const vendors = await Vendor.find().populate('firm');
        res.json({ vendors });
    } catch (error) {
        console.error("Error in getAllVendors:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

const getVendorById = async (req, res) => {
    try {
        const vendorId = req.params.id; 

        const vendor = await Vendor.findById(vendorId).populate('firm');
        if (!vendor) {
            return res.status(404).json({ error: "Vendor not found" });
        }

        const vendorFirmId = vendor.firm.length > 0 ? vendor.firm[0]._id : null;

        res.status(200).json({ vendorId, vendorFirmId, vendor });
        console.log("Vendor found:", vendor);

    } catch (error) {
        console.error("Error in getVendorById:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

module.exports = { vendorRegister, vendorLogin, getAllVendors, getVendorById };
                
