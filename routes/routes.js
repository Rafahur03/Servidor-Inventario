import express from 'express';
import { iniciaSesion } from '../controllers/controllers.js';

const router = express.Router()

router.get('/', iniciaSesion)


export default  router