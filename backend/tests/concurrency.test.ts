import { afterAll, beforeAll, describe, expect, it } from "vitest";
import request from "supertest";
import app from "../src/app.js";
import { db } from "../src/db/index.js";
import { eventSchema, orderItemSchema, orderSchema, ticketSchema, ticketTypeSchema, userSchema } from "../src/db/schema.js";
import { createAccessToken } from "../src/services/authTokens.service.js";
import { nanoid } from "nanoid";
import crypto from "node:crypto"
import { eq, or } from "drizzle-orm";

describe("Check-in Concurrency Test", () => {
  let organizerToken: string;
  let testQrToken: string;
  let testTicketId: string;

  let testUserId: string;
  let testEventId: string;
  let testTicketTypeId: string;
  let testOrderId: string;

  beforeAll(async () => {
    const [organizer] = await 
      db.insert(userSchema).values({
      name: "Test Organizer",
      email: `organizer-${Date.now()}@test.com`,
      passwordHash: "dummy-hash",
    }).returning();

    testUserId = organizer.id;

    organizerToken = createAccessToken(organizer.id, "USER");

    const [event] = await db.insert(eventSchema).values({
      organizerId: organizer.id,
      name: "Concurrency Test",
      venue: "Test Venue",
      city: "Test City",
      description: "Test Event",
      dateTime: new Date(Date.now() + 86400000),
    }).returning();

    testEventId = event.id;

    const [ticketType] = await db.insert(ticketTypeSchema).values({
      eventId: event.id,
      name: "VIP",
      price: 100,
      quantity: 1,
    }).returning();

    testTicketTypeId = ticketType.id;

    const [order] = await db.insert(orderSchema).values({
      userId: organizer.id,
      eventId: event.id,
      totalAmount: 100,
      status: "COMPLETED",
    }).returning();

    testOrderId = order.id;

    testQrToken = crypto.randomBytes(32).toString("hex");
    
    const [ticket] = await db.insert(ticketSchema).values({
      attendeeId: organizer.id,
      eventId: event.id,
      orderId: order.id,
      ticketTypeId: ticketType.id,
      shortId: nanoid(6),
      qrToken: testQrToken,
      status: "VALID",
    }).returning();
    testTicketId = ticket.id;
  });

  it("should have one pass with 200 OK, other fail with 409 Conflict", async () => {
    const [res1, res2] = await Promise.all([
      request(app).post("/api/ticket/checkin").set("Authorization", `Bearer ${organizerToken}`).send({qrToken: testQrToken}),
      request(app).post("/api/ticket/checkin").set("Authorization", `Bearer ${organizerToken}`).send({qrToken: testQrToken}),
    ])

    const responseCheck = 
      (res1.status === 200 && res2.status === 409) ||
      (res1.status === 409 && res2.status === 200);

    expect(responseCheck).toBe(true);
  })

  afterAll(async () => {
    await db.delete(ticketSchema)
    .where(eq(ticketSchema.id, testTicketId));
    
    await db.delete(orderSchema)
    .where(eq(orderSchema.id, testOrderId));
    
    await db.delete(ticketTypeSchema)
    .where(eq(ticketTypeSchema.id, testTicketTypeId));
    
    await db.delete(eventSchema)
    .where(eq(eventSchema.id, testEventId));
    
    await db.delete(userSchema)
      .where(eq(userSchema.id, testUserId));
  })
})

describe("Booking Concurrency Test", () => {
  let userToken1: string;
  let userToken2: string;
  let testUserId1: string;
  let testUserId2: string;
  
  let testEventId: string;
  let testTicketTypeId: string;
  let testOrderId: string;

  beforeAll(async () => {
    const [user1] = await 
      db.insert(userSchema).values({
      name: "Test user 1",
      email: `user1-${Date.now()}@test.com`,
      passwordHash: "dummy-hash1",
    }).returning();

    const [user2] = await 
      db.insert(userSchema).values({
      name: "Test user2",
      email: `user2-${Date.now()}@test.com`,
      passwordHash: "dummy-hash2",
    }).returning();

    testUserId1 = user1.id;
    testUserId2 = user2.id;

    userToken1 = createAccessToken(user1.id, "USER");
    userToken2 = createAccessToken(user2.id, "USER");

    const [event] = await db.insert(eventSchema).values({
      organizerId: user1.id,
      name: "Concurrency Test",
      venue: "Test Venue",
      city: "Test City",
      description: "Test Event",
      dateTime: new Date(Date.now() + 86400000),
    }).returning();

    testEventId = event.id;

    const [ticketType] = await db.insert(ticketTypeSchema).values({
      eventId: event.id,
      name: "VIP",
      price: 100,
      quantity: 1,
    }).returning();

    testTicketTypeId = ticketType.id;    
  });

  it("should have one pass with 200 OK, other fail with 409 Conflict", async () => {
    const [res1, res2] = await Promise.all([
      request(app).post("/api/order").set("Authorization", `Bearer ${userToken1}`).send({
        eventId: testEventId, items: [{
        ticketTypeId: testTicketTypeId,
        quantity: 1
      }]}),
      request(app).post("/api/order").set("Authorization", `Bearer ${userToken2}`).send({
        eventId: testEventId, items: [{
        ticketTypeId: testTicketTypeId,
        quantity: 1
      }]}),
    ])

    const responseCheck = 
      (res1.status === 201 && res2.status === 400) || 
      (res1.status === 400 && res2.status === 201)

    testOrderId = res1.status === 201 ? res1.body.id : res2.body.id;

    expect(responseCheck).toBe(true);
  })

  afterAll(async () => {    
    if (testOrderId) {
      await db.delete(orderItemSchema).where(eq(orderItemSchema.orderId, testOrderId));
      
      await db.delete(orderSchema).where(eq(orderSchema.id, testOrderId));
    }
    
    await db.delete(ticketTypeSchema)
    .where(eq(ticketTypeSchema.id, testTicketTypeId));
    
    await db.delete(eventSchema)
    .where(eq(eventSchema.id, testEventId));
    
    await db.delete(userSchema)
      .where(or(
        eq(userSchema.id, testUserId1),
        eq(userSchema.id, testUserId2),
      ));
  })
})
