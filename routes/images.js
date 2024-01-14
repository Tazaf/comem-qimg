import express from "express";
import { v4 as uuidv4 } from "uuid";
import { prisma } from "../app.js";
import { authenticate, requireUser } from "../lib/auth.js";
import { config } from "../lib/config.js";
import { upload } from "../lib/upload.js";
import { asyncHandler } from "../lib/utils.js";
import { sendError } from "../lib/utils.js";

const router = express.Router();

/**
 * @api {get} /api/images/ Retrieve all images for a user
 * @apiName Retrieve all images
 *
 * @apiGroup Images
 *
 * @apiHeader {String} Authorization The Authorization header must contain a user's bearer token. Administrators are not allowed access to this resource.
 *
 * @apiSuccess (200) {Object[]} images List of all images
 * @apiSuccess (200) {String} images.id UUID of the image
 * @apiSuccess (200) {Number} images.size Image size in bytes
 * @apiSuccess (200) {String} images.url Image URL
 * @apiSuccess (200) {String} images.createdAt Image creation time as ISO date
 * @apiSuccessExample {json} Success-Response:
 * HTTP/1.1 200 OK
 * [
 *   {
 *       "id": "35667548-c734-4650-86c4-1fc474db1aec",
 *       "size": 297105,
 *       "url": "http://localhost:3000/api/images/35667548-c734-4650-86c4-1fc474db1aec.png",
 *       "createdAt": "2023-01-04T17:04:47.770Z"
 *   }
 * ]
 * @apiError (401) Unauthorized No Authorization header sent.
 * @apiError (401) Invalid Invalid Bearer token.
 * @apiError (403) Forbidden Administrators cannot perform this action.
 */

router.get(
  "/",
  authenticate,
  asyncHandler(async (req, res) => {
    const options = {
      orderBy: [
        {
          createdAt: "desc"
        }
      ]
    };

    if (!req.authToken.admin) {
      options.where = { tokenID: req.authToken.id };
    }

    const images = await prisma.image.findMany(options);
    res.send(images.map((image) => serializeImage(image, req)));
  })
);

/**
 * @api {post} /api/images/ Upload an image
 * @apiName Upload an image
 * @apiDescription Use the ``application/json`` content type to upload base64-encoded data, or use the ``multipart/form-data`` content type to upload an image file.
 * Images cannot be larger than 2MB. (When sending base64-encoded image data, the entire JSON payload cannot be larger than 2MB.)
 *
 * ### Quota
 *
 * **If you have reached the image quota (10 by default), your oldest uploaded images will be purged.**
 * @apiGroup Images
 *
 * @apiHeader {String} Authorization The Authorization header must contain a user's bearer token. Administrators are not allowed access to this resource.
 *
 * @apiParamExample {json} application/json
 *  {
 *    "data" : "/9j/4QCmRXhpZgAATU0AKgAAAAgABwEOAAIAAAAPAAAAY...
 *  }
 *
 * @apiParamExample {json} multipart/form-data
 * Content-Type: multipart/form-data; boundary=AaB03x
 *
 * --AaB03x
 * Content-Disposition: form-data; name="image"; filename="image.png"
 * Content-Type: image/png
 *
 * ... contents of image.png ...
 * --AaB03x--
 *
 * @apiSuccess (201) {String} id UUID of the image
 * @apiSuccess (201) {Number} size Image size in bytes
 * @apiSuccess (201) {String} url Image URL
 * @apiSuccess (201) {String} createdAt Image creation time as ISO date
 * @apiSuccessExample {json} Success-Response:
 * HTTP/1.1 201 OK
 * {
 *    "id": "23e050b3-53ec-4cc7-8d07-f69401e3af8c",
 *    "size": 297105,
 *    "url": "http://localhost:3000/api/images/23e050b3-53ec-4cc7-8d07-f69401e3af8c.png",
 *    "createdAt": "2023-01-04T17:23:08.924Z"
 * }
 * @apiError (401) Unauthorized No Authorization header sent.
 * @apiError (401) Invalid Invalid Bearer token.
 * @apiError (403) Forbidden Administrators cannot perform this action.
 */

router.post(
  "/",
  authenticate,
  requireUser,
  upload.single("image"),
  asyncHandler(async (req, res) => {
    const data = {
      appID: uuidv4(),
      createdAt: new Date(),
      tokenID: req.authToken.id
    };

    if (req.is("application/json")) {
      if (!req.body.data) {
        return sendError(
          422,
          'The "data" property must contain the base64-encoded image data.',
          res
        );
      }

      data.imageData = req.body.data;
      data.imageSize = Buffer.byteLength(data.imageData, "base64");
    } else if (req.is("multipart/form-data")) {
      if (!req.file || !req.file.fieldname === "image") {
        return sendError(422, 'The "image" field is not set.', res);
      }

      data.imageData = req.file.buffer.toString("base64");
      data.imageSize = Buffer.byteLength(data.imageData, "base64");
    } else {
      return sendError(
        415,
        "The request must have content type application/json or multipart/form-data.",
        res
      );
    }

    const image = await prisma.image.create({ data });
    await purgeImages(req.authToken, res);
    res.status(201).send(serializeImage(image, req));
  })
);


router.get(
  "/:id.png",
  asyncHandler(async (req, res) => {
    const image = await prisma.image.findUnique({
      where: {
        appID: req.params.id
      }
    });
    if (image) {
      res.set("Content-Type", "image/png");
      res.send(new Buffer.from(image.imageData, "base64"));
    } else {
      return sendError(404, "No image found with this id", res);
    }
  })
);

/**
 * @api {delete} /api/images/:imageID Delete an uploaded image
 * @apiName Delete an uploaded image
 *
 * @apiGroup Images
 * 
 * @apiParam { String } imageID The image's's UUID

 * @apiHeader {String} Authorization The Authorization header must contain a user's bearer token.
 * @apiSuccess (204) String No content
 * @apiError (401) Unauthorized No Authorization header sent.
 * @apiError (401) Invalid Invalid Bearer token.
 * @apiError (403) Forbidden Administrators cannot perform this action.
 * @apiError (404) NotFound No image found with this id.

 */

router.delete(
  "/:id",
  authenticate,
  requireUser,
  asyncHandler(async (req, res) => {
    const options = {
      where: {
        AND: [
          {
            appID: {
              equals: req.params.id
            }
          },
          {
            tokenID: {
              equals: req.authToken.id
            }
          }
        ]
      }
    };

    const image = await prisma.image.deleteMany(options);
    if (image.count) {
      res.sendStatus(204);
    } else {
      return sendError(404, "No image found with this id", res);
    }
  })
);

const purgeImages = async (authToken, res) => {
  try {
    const images = await prisma.image.findMany({
      where: {
        tokenID: authToken.id
      },
      skip: config.imageQuota,
      orderBy: [
        {
          createdAt: "desc"
        }
      ]
    });

    if (Array.isArray(images) && images.length) {
      const imagesToDelete = images.map((image) => image.appID);
      await prisma.image.deleteMany({
        where: {
          appID: {
            in: imagesToDelete
          }
        }
      });
    }
  } catch (err) {
    return sendError(409, "Could not purge images", res);
  }
};

const serializeImage = (image, req) => {
  const serialized = {
    id: image.appID,
    size: image.imageSize,
    url: `${config.appURL}/api/images/${image.appID}.png`,
    createdAt: image.createdAt.toISOString()
  };

  if (req.authToken.admin) {
    console.log(image);
    serialized.tokenID = image.tokenID;
  }
  return serialized;
};

export default router;
