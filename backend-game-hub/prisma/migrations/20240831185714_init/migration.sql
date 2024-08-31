-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "wallet" TEXT NOT NULL,
    "username" TEXT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Game" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "Game_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Token" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "supply" DOUBLE PRECISION NOT NULL,
    "address" TEXT NOT NULL,
    "gameId" INTEGER NOT NULL,

    CONSTRAINT "Token_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NFTContract" (
    "id" SERIAL NOT NULL,
    "address" TEXT NOT NULL,
    "gameId" INTEGER NOT NULL,

    CONSTRAINT "NFTContract_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NFTCollection" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "metadata" JSONB NOT NULL,
    "contractId" INTEGER NOT NULL,

    CONSTRAINT "NFTCollection_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_wallet_key" ON "User"("wallet");

-- CreateIndex
CREATE UNIQUE INDEX "Token_address_key" ON "Token"("address");

-- CreateIndex
CREATE UNIQUE INDEX "NFTContract_address_key" ON "NFTContract"("address");

-- AddForeignKey
ALTER TABLE "Game" ADD CONSTRAINT "Game_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Token" ADD CONSTRAINT "Token_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NFTContract" ADD CONSTRAINT "NFTContract_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NFTCollection" ADD CONSTRAINT "NFTCollection_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "NFTContract"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
