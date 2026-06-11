const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { protect } = require('../middleware/auth');
const {
  getContacts, getContact, createContact, updateContact, deleteContact,
  bulkDelete, toggleFavorite, exportCSV, importCSV, getStats, getTags, getGroups
} = require('../controllers/contactController');

const storage = multer.diskStorage({
  destination: '/tmp',
  filename: (req, file, cb) => {
    cb(null, `import_${Date.now()}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/csv' || path.extname(file.originalname).toLowerCase() === '.csv') {
      cb(null, true);
    } else {
      cb(new Error('Only CSV files are allowed'));
    }
  }
});

router.use(protect);

router.get('/stats', getStats);
router.get('/export', exportCSV);
router.post('/import', upload.single('file'), importCSV);
router.get('/tags', getTags);
router.get('/groups', getGroups);
router.delete('/bulk', bulkDelete);

router.route('/')
  .get(getContacts)
  .post(createContact);

router.route('/:id')
  .get(getContact)
  .put(updateContact)
  .delete(deleteContact);

router.patch('/:id/favorite', toggleFavorite);

module.exports = router;
