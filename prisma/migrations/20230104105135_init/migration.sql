-- CreateTable
CREATE TABLE "Token" (
    "id" SERIAL NOT NULL,
    "appID" VARCHAR(36) NOT NULL,
    "token" VARCHAR(255) NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Token_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Image" (
    "id" SERIAL NOT NULL,
    "appID" VARCHAR(36) NOT NULL,
    "imageData" TEXT NOT NULL,
    "imageSize" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "tokenID" INTEGER NOT NULL,

    CONSTRAINT "Image_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Token_appID_key" ON "Token"("appID");

-- CreateIndex
CREATE UNIQUE INDEX "Token_token_key" ON "Token"("token");

-- CreateIndex
CREATE UNIQUE INDEX "Image_appID_key" ON "Image"("appID");

-- AddForeignKey
ALTER TABLE "Image" ADD CONSTRAINT "Image_tokenID_fkey" FOREIGN KEY ("tokenID") REFERENCES "Token"("id") ON DELETE CASCADE ON UPDATE CASCADE;
