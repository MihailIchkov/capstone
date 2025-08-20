import express from 'express';
import multer from 'multer';
import path from 'path';
import { 
  getAllAnimals, 
  getAnimalById, 
  createAnimal, 
  updateAnimal, 
  deleteAnimal 
} from '../controllers/animalController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/') // Make sure this directory exists
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(new Error('Only images are allowed!'));
    }
  }
});

// Public routes
router.get('/', getAllAnimals);
router.get('/:id', getAnimalById);

// Protected routes (require authentication)
router.post('/', authenticateToken, upload.single('image'), createAnimal);
router.put('/:id', authenticateToken, upload.single('image'), updateAnimal);
router.delete('/:id', authenticateToken, deleteAnimal);

export default router;
