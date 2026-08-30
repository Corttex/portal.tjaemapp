const express = require('express');
const router = express.Router();
const multer = require('multer');
const membersController = require('../controllers/members.controller');
const path = require('path');

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '..', '..', 'production_artifacts'));
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

// Routes
router.get('/search', membersController.searchMembers);

router.post('/update', upload.fields([
    { name: 'identidade', maxCount: 1 },
    { name: 'carteiraAtual', maxCount: 1 }
]), membersController.updateMember);

router.post('/reset', membersController.resetMembers);

router.post('/webhook/asaas', express.json(), membersController.handleWebhook);

module.exports = router;
