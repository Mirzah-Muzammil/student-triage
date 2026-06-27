CREATE TABLE "AiProviderStatus" (
    "provider" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "lastCheckedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastError" TEXT,
    "requestLimit" INTEGER,
    "remainingRequests" INTEGER,
    "tokenLimit" INTEGER,
    "remainingTokens" INTEGER,
    "requestReset" TEXT,
    "tokenReset" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AiProviderStatus_pkey" PRIMARY KEY ("provider")
);
