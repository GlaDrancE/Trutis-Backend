-- CreateEnum
CREATE TYPE "authProviderProps" AS ENUM ('google', 'manual');

-- CreateEnum
CREATE TYPE "QRCodesStatus" AS ENUM ('Active', 'Inactive');

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
    "isActive" BOOLEAN NOT NULL DEFAULT true,
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
CREATE TABLE "Clients" (
    "id" TEXT NOT NULL,
    "qr_id" TEXT,
    "public_key" TEXT,
    "customer_id" TEXT,
    "shop_name" TEXT,
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
    "couponValidity" INTEGER,
    "staffId" TEXT,
    "staffPassword" TEXT,
    "staffStatus" BOOLEAN,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Clients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Coupons" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "validFrom" TIMESTAMP(3) NOT NULL DEFAULT NOW() + interval '1 day',
    "validTill" TIMESTAMP(3) NOT NULL,
    "maxDiscount" INTEGER,
    "minOrderValue" INTEGER,
    "isUsed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Coupons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Customers" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "DOB" TIMESTAMP(3) NOT NULL,
    "ratings" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Customers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CouponClients" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "couponId" TEXT NOT NULL,
    "isUsed" BOOLEAN NOT NULL,
    "usedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CouponClients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CouponCustomers" (
    "id" TEXT NOT NULL,
    "couponId" TEXT NOT NULL,
    "customersId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CouponCustomers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CouponClientsCustomers" (
    "id" TEXT NOT NULL,
    "couponClientID" TEXT NOT NULL,
    "couponCustomerId" TEXT NOT NULL,

    CONSTRAINT "CouponClientsCustomers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Points" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "points" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Points_pkey" PRIMARY KEY ("id")
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
    "payment_type" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "invoice_id" TEXT,
    "transaction_id" TEXT,
    "stripe_customer_id" TEXT,
    "product_id" TEXT,
    "city" TEXT,
    "state" TEXT,
    "zip" TEXT,
    "country" TEXT,
    "line1" TEXT,
    "line2" TEXT,
    "subscription_id" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClientPayments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Subscriptions" (
    "id" TEXT NOT NULL,
    "subscription_id" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL,
    "customer_id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "subscription_status" TEXT NOT NULL,
    "collection_method" TEXT NOT NULL,
    "currency" TEXT NOT NULL,
    "cancel_at_period_end" BOOLEAN,
    "current_period_end" TIMESTAMP(3),
    "canceled_at" TIMESTAMP(3),
    "interval" TEXT NOT NULL,
    "interval_count" INTEGER NOT NULL,
    "plan_id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Admin_email_key" ON "Admin"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Agent_email_key" ON "Agent"("email");

-- CreateIndex
CREATE UNIQUE INDEX "QRCodes_public_key_key" ON "QRCodes"("public_key");

-- CreateIndex
CREATE UNIQUE INDEX "QRCodes_private_key_key" ON "QRCodes"("private_key");

-- CreateIndex
CREATE UNIQUE INDEX "QRCodes_client_id_key" ON "QRCodes"("client_id");

-- CreateIndex
CREATE UNIQUE INDEX "Clients_qr_id_key" ON "Clients"("qr_id");

-- CreateIndex
CREATE UNIQUE INDEX "Clients_public_key_key" ON "Clients"("public_key");

-- CreateIndex
CREATE UNIQUE INDEX "Clients_customer_id_key" ON "Clients"("customer_id");

-- CreateIndex
CREATE UNIQUE INDEX "Clients_email_key" ON "Clients"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Points_customerId_key" ON "Points"("customerId");

-- CreateIndex
CREATE UNIQUE INDEX "Subscriptions_subscription_id_key" ON "Subscriptions"("subscription_id");

-- CreateIndex
CREATE UNIQUE INDEX "Subscriptions_customer_id_key" ON "Subscriptions"("customer_id");

-- AddForeignKey
ALTER TABLE "AgentClients" ADD CONSTRAINT "AgentClients_agent_id_fkey" FOREIGN KEY ("agent_id") REFERENCES "Agent"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgentClients" ADD CONSTRAINT "AgentClients_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "Clients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QRCodes" ADD CONSTRAINT "QRCodes_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "Clients"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Clients" ADD CONSTRAINT "Clients_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "Subscriptions"("customer_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CouponClients" ADD CONSTRAINT "CouponClients_couponId_fkey" FOREIGN KEY ("couponId") REFERENCES "Coupons"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CouponClients" ADD CONSTRAINT "CouponClients_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Clients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CouponCustomers" ADD CONSTRAINT "CouponCustomers_couponId_fkey" FOREIGN KEY ("couponId") REFERENCES "Coupons"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CouponCustomers" ADD CONSTRAINT "CouponCustomers_customersId_fkey" FOREIGN KEY ("customersId") REFERENCES "Customers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CouponClientsCustomers" ADD CONSTRAINT "CouponClientsCustomers_couponClientID_fkey" FOREIGN KEY ("couponClientID") REFERENCES "CouponClients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CouponClientsCustomers" ADD CONSTRAINT "CouponClientsCustomers_couponCustomerId_fkey" FOREIGN KEY ("couponCustomerId") REFERENCES "CouponCustomers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Points" ADD CONSTRAINT "Points_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientPlans" ADD CONSTRAINT "ClientPlans_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "Clients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientPlans" ADD CONSTRAINT "ClientPlans_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "Plans"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientPayments" ADD CONSTRAINT "ClientPayments_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "Clients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientPayments" ADD CONSTRAINT "ClientPayments_subscription_id_fkey" FOREIGN KEY ("subscription_id") REFERENCES "Subscriptions"("subscription_id") ON DELETE SET NULL ON UPDATE CASCADE;
