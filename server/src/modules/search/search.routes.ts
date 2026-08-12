import { Router } from "express";
import { handleGlobalSearch } from "./search.controller";
import { authenticate } from "../../middleware/authenticate"; 

const router = Router();

router.get("/", authenticate, handleGlobalSearch);

export default router;