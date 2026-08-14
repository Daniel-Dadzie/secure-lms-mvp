import { Router } from "express";
import * as helpController from "./help.controller";

const router = Router();

router.get("/articles", helpController.getPublishedArticles);

export default router;
