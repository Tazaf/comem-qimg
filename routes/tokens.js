import crypto from "crypto";
import express from "express";
import { v4 as uuidv4 } from "uuid";
import { prisma } from "../app.js";
import { authenticate, requireAdmin } from "../lib/auth.js";
import { asyncHandler, sendError } from "../lib/utils.js";

const router = express.Router();

/**
 * @api {get} /api/tokens/ Retrieve all tokens
 * @apiName RetrieveTokens
 *
 * @apiGroup Tokens
 *
 * @apiHeader {String} Authorization The Authorization header must contain the administrator's bearer token. Users are not allowed access to this resource.
 *
 * @apiSuccess (200) {Object[]} tokens List of all authorization tokens
 * @apiSuccess (200) {Number} tokens.id Database ID of the Token
 * @apiSuccess (200) {String} tokens.appID UUID of the Token
 * @apiSuccess (200) {String} tokens.token The token itself
 * @apiSuccess (200) {String} tokens.name Name associated with the token
 * @apiSuccess (200) {String} tokens.createdAt Token creation time as ISO Date
 * @apiSuccess (200) {String} tokens.expiresAt Token expiry as ISO Date
 * @apiSuccessExample {json} Success-Response:
 * HTTP/1.1 200 OK
 * [
 *    {
 *      "id": 1,
 *      "appID": "db03776d-5ad6-410f-bb9c-c71158822407",
 *      "token": "is9QxrDoiGN+mzyljTN2SzewBlqGl9Vi/dinJJaB30zx8TplpBL7iv9GQ+JyJxG/BKXRG+VPoM/zmNl/Z8WYxxrypuJlcA/vMcM2yj4zwupEBJOP6a0vyVSgywn9iY0bU6r4/fqJaLQWrRA252mAPPUcEvCgZ2Vy4+QzSVCc7lY=",
 *      "name": "Example App",
 *      "createdAt": "2023-01-04T16:32:52.961Z",
 *      "expiresAt": "2023-02-03T16:32:52.961Z"
 *    }
 * ]
 * @apiError (401) Unauthorized No Authorization header sent.
 * @apiError (401) Invalid Invalid Bearer token.
 * @apiError (403) Forbidden You must be an administrator to perform this action.
 */

router.get(
  "/",
  authenticate,
  requireAdmin,
  asyncHandler(async (req, res, next) => {
    const tokens = await prisma.token.findMany({
      orderBy: [
        {
          createdAt: "desc"
        }
      ]
    });
    res.send(tokens);
  })
);

/**
 * @api {post} /api/tokens/ Create a new Token
 * @apiName CreateToken
 * @apiDescription Create a user authentication token. This token can be used to upload and list images as a user.
 * Tokens are only valid for a limited time. You can specify an optional lifetime property (in seconds) which defaults to 2,592,000 (30 days). It must be at least 1 second and at most 31,536,000 seconds (365 days).
 * You must provide a name property (up to 50 characters long). *
 * @apiGroup Tokens
 *
 * @apiHeader {String} Authorization The Authorization header must contain the administrator's bearer token. Users are not allowed access to this resource.
 * @apiBody {String{..50}} name Mandatory name for associated with the token
 * @apiBody {Number{1-31536000}} [lifetime=2592000] The validity duration for the generated token, in seconds.
 * @apiParamExample {json} Request body example:
 * {
 *   "name": "Example App"
 * }
 * @apiSuccess (201) {Number} id Database ID of the Token
 * @apiSuccess (201) {String} appID UUID of the Token
 * @apiSuccess (201) {String} token The token itself
 * @apiSuccess (201) {String} name Name associated with the token.
 * @apiSuccess (201) {String} createdAt Token creation time as ISO Date.
 * @apiSuccess (201) {String} expiresAt Token expiry as ISO Date.
 * @apiSuccessExample {json} Success-Response:
 * HTTP/1.1 201 OK
 * {
 *    "id": 1,
 *    "appID": "db03776d-5ad6-410f-bb9c-c71158822407",
 *    "token": "is9QxrDoiGN+mzyljTN2SzewBlqGl9Vi/dinJJaB30zx8TplpBL7iv9GQ+JyJxG/BKXRG+VPoM/zmNl/Z8WYxxrypuJlcA/vMcM2yj4zwupEBJOP6a0vyVSgywn9iY0bU6r4/fqJaLQWrRA252mAPPUcEvCgZ2Vy4+QzSVCc7lY=",
 *    "name": "Example App",
 *    "createdAt": "2023-01-04T16:32:52.961Z",
 *    "expiresAt": "2023-02-03T16:32:52.961Z"
 * }
 * @apiError (401) Unauthorized No Authorization header sent.
 * @apiError (401) Invalid Invalid Bearer token.
 * @apiError (403) Forbidden You must be an administrator to perform this action..
 */
router.post(
  "/",
  authenticate,
  requireAdmin,
  asyncHandler(async (req, res, next) => {
    const lifetime = req.body.lifetime || 60 * 60 * 24 * 30;
    if (!Number.isInteger(lifetime) || lifetime <= 0 || !lifetime > 31536000) {
      return sendError(
        422,
        'The "lifetime" property must be an integer greater than 0 and smaller or equal to 31,536,000 (365 days).',
        res
      );
    }

    if (req.body.name !== undefined && typeof req.body.name != "string") {
      return utils.sendError(422, 'The "name" property must be a string.', res);
    } else if (req.body.name && req.body.name.length > 50) {
      return utils.sendError(
        422,
        'The "name" property must not be longer than 50 characters.',
        res
      );
    }

    const now = new Date();
    const expiresAt = new Date(now.getTime() + parseInt(lifetime, 10) * 1000);
    console.log(req.body.name);
    const token = await prisma.token.create({
      data: {
        appID: uuidv4(),
        token: crypto.randomBytes(128).toString("base64"),
        name: req.body.name,
        createdAt: now,
        expiresAt: expiresAt
      }
    });

    res.status(201);
    res.send(token);
  })
);

/**
 * @api {delete} /api/tokens/:tokenID Delete a token
 * @apiName DeleteToken
 *
 * @apiGroup Tokens
 *
 * @apiParam { String } tokenID The token's UUID
 * @apiHeader {String} Authorization The Authorization header must contain the administrator's bearer token. Users are not allowed access to this resource.
 * @apiSuccess (204) String No content
 * @apiError (401) Unauthorized No Authorization header sent.
 * @apiError (401) Invalid Invalid Bearer token.
 * @apiError (403) Forbidden You must be an administrator to perform this action..
 */

router.delete(
  "/:id",
  authenticate,
  requireAdmin,
  asyncHandler(async (req, res) => {
    await prisma.token.delete({
      where: {
        appID: req.params.id
      }
    });
    res.sendStatus(204);
  })
);

export default router;
