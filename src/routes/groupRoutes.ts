import { Router } from 'express';
import { groupController } from '../Controller/groupController';
import { authMiddleware } from '../middlewares/authMiddleware';
import { roleMiddleware } from '../middlewares/roleMiddleware';
import { requiredString } from '../utils/validationUtils';
import { validationMiddleware } from '../middlewares/validationMiddleware';
const router=Router();router.use(authMiddleware,roleMiddleware('admin'));router.get('/',groupController.list);router.post('/',validationMiddleware(req=>{requiredString(req.body.code,'code',40);requiredString(req.body.name,'name',160);}),groupController.create);router.put('/:id',validationMiddleware(req=>{requiredString(req.body.code,'code',40);requiredString(req.body.name,'name',160);}),groupController.update);router.delete('/:id',groupController.remove);export default router;
