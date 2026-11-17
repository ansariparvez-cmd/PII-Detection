import { Router } from "express";

import { deidentifyController } from "../controllers/deidentify.controller";

const router = Router();

router.post("/", deidentifyController);

export default router;
