CREATE TABLE "RequestFollowUp" (
    "id" TEXT NOT NULL,
    "requestId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sender" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "disposition" TEXT,

    CONSTRAINT "RequestFollowUp_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "RequestFollowUp_requestId_idx" ON "RequestFollowUp"("requestId");
CREATE INDEX "RequestFollowUp_createdAt_idx" ON "RequestFollowUp"("createdAt");

ALTER TABLE "RequestFollowUp" ADD CONSTRAINT "RequestFollowUp_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "Request"("id") ON DELETE CASCADE ON UPDATE CASCADE;
