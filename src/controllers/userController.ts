import { Context } from "hono";
import { PutCommand } from "@aws-sdk/lib-dynamodb";
import { v4 as uuidv4 } from "uuid";
import { db, TABLE_NAME } from "../config/db";

export const createUser = async (c: Context) => {
  try {
    const body = await c.req.json();
    const name = body.name;
    const email = body.email;

    if (!name || !email) {
      return c.json({ error: "Name and email are required" }, 400);
    }

    const userId = uuidv4();
    const createdAt = new Date().toISOString();

    const userItem = {
      PK: `USER#${email}`,
      SK: "PROFILE",
      id: userId,
      email: email,
      name: name,
      createdAt: createdAt,
      entity: "User",
    };

    const command = new PutCommand({
      TableName: TABLE_NAME,
      Item: userItem,
      ConditionExpression: "attribute_not_exists(PK)",
    });

    await db.send(command);

    return c.json(
      {
        message: "User created successfully",
        data: {
          id: userId,
          email: email,
          name: name,
        },
      },
      201,
    );
  } catch (error: any) {
    console.error("Error creating user:", error);

    if (error.name === "ConditionalCheckFailedException") {
      return c.json({ error: "User with this email already exists" }, 409);
    }

    return c.json({ error: "Internal Server Error" }, 500);
  }
};
