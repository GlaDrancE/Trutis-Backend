-- CreateEnum
CREATE TYPE "authProviderProps" AS ENUM ('google', 'manual');

-- CreateEnum
CREATE TYPE "QRCodesStatus" AS ENUM ('Active', 'Inactive');

-- CreateEnum
CREATE TYPE "CouponCodeType" AS ENUM ('Fixed', 'Discount');

-- CreateTable
CREATE TABLE "Admin" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Admin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Agent" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "profile" TEXT NOT NULL,
    "type_of_employment" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Agent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AgentClients" (
    "id" TEXT NOT NULL,
    "agent_id" TEXT NOT NULL,
    "client_id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AgentClients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Clients" (
    "id" TEXT NOT NULL,
    "shop_name" TEXT,
    "qr_id" TEXT,
    "owner_name" TEXT NOT NULL,
    "address" TEXT,
    "phone" TEXT,
    "email" TEXT NOT NULL,
    "logo" TEXT,
    "googleAPI" TEXT,
    "ipAddress" TEXT NOT NULL,
    "contractTime" TIMESTAMP(3) NOT NULL,
    "authProvider" "authProviderProps",
    "password" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL,
    "minOrderValue" INTEGER,
    "maxDiscount" INTEGER,

    CONSTRAINT "Clients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QRCodes" (
    "id" TEXT NOT NULL,
    "public_key" TEXT NOT NULL,
    "private_key" TEXT NOT NULL,
    "client_id" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "QRCodes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClientPlans" (
    "id" TEXT NOT NULL,
    "client_id" TEXT NOT NULL,
    "plan_id" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClientPlans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Plans" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "price" DECIMAL(65,30) NOT NULL,
    "level" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClientPayments" (
    "id" TEXT NOT NULL,
    "client_id" TEXT NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "payment_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "payment_type" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "invoice_id" TEXT,
    "transaction_id" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClientPayments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SubscriptionPlans" (
    "id" TEXT NOT NULL,
    "client_id" TEXT NOT NULL,
    "client_payments_id" TEXT NOT NULL,
    "expirationDate" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SubscriptionPlans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CouponClients" (
    "id" TEXT NOT NULL,
    "client_id" TEXT NOT NULL,
    "coupon_id" TEXT NOT NULL,
    "is_used" BOOLEAN NOT NULL,
    "used_at" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CouponClients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Coupons" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "discountType" "CouponCodeType" NOT NULL,
    "validFrom" TIMESTAMP(3) NOT NULL DEFAULT NOW() + interval '1 day',
    "validTill" TIMESTAMP(3) NOT NULL,
    "maxDiscount" INTEGER,
    "minOrderValue" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "couponClientsId" TEXT,

    CONSTRAINT "Coupons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomersReview" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "DOB" TIMESTAMP(3) NOT NULL,
    "ratings" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CustomersReview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomersCoupons" (
    "id" TEXT NOT NULL,
    "customersReviewId" TEXT NOT NULL,
    "couponId" TEXT NOT NULL,

    CONSTRAINT "CustomersCoupons_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Admin_email_key" ON "Admin"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Agent_email_key" ON "Agent"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Clients_qr_id_key" ON "Clients"("qr_id");

-- CreateIndex
CREATE UNIQUE INDEX "Clients_email_key" ON "Clients"("email");

-- CreateIndex
CREATE UNIQUE INDEX "QRCodes_public_key_key" ON "QRCodes"("public_key");

-- CreateIndex
CREATE UNIQUE INDEX "QRCodes_private_key_key" ON "QRCodes"("private_key");

-- CreateIndex
CREATE UNIQUE INDEX "QRCodes_client_id_key" ON "QRCodes"("client_id");

-- CreateIndex
CREATE UNIQUE INDEX "CustomersCoupons_customersReviewId_key" ON "CustomersCoupons"("customersReviewId");

-- AddForeignKey
ALTER TABLE "AgentClients" ADD CONSTRAINT "AgentClients_agent_id_fkey" FOREIGN KEY ("agent_id") REFERENCES "Agent"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgentClients" ADD CONSTRAINT "AgentClients_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "Clients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QRCodes" ADD CONSTRAINT "QRCodes_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "Clients"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientPlans" ADD CONSTRAINT "ClientPlans_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "Clients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientPlans" ADD CONSTRAINT "ClientPlans_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "Plans"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientPayments" ADD CONSTRAINT "ClientPayments_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "Clients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubscriptionPlans" ADD CONSTRAINT "SubscriptionPlans_client_payments_id_fkey" FOREIGN KEY ("client_payments_id") REFERENCES "ClientPayments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubscriptionPlans" ADD CONSTRAINT "SubscriptionPlans_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "Clients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CouponClients" ADD CONSTRAINT "CouponClients_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "Clients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Coupons" ADD CONSTRAINT "Coupons_couponClientsId_fkey" FOREIGN KEY ("couponClientsId") REFERENCES "CouponClients"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomersCoupons" ADD CONSTRAINT "CustomersCoupons_customersReviewId_fkey" FOREIGN KEY ("customersReviewId") REFERENCES "CustomersReview"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomersCoupons" ADD CONSTRAINT "CustomersCoupons_couponId_fkey" FOREIGN KEY ("couponId") REFERENCES "Coupons"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
