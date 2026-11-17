import type { RequestHandler } from "express";

import { deidentifyText } from "../services/deidentification.service";
import { validateRequestBody } from "../utils/request-body-validate";

export const deidentifyController: RequestHandler = (req, res, next): void => {
  try {
    const { text, entities } = validateRequestBody(req.body);

    const result = deidentifyText(text, entities);

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};
