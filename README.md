# Notes API - Hono & DynamoDB

A serverless-ready REST API built with **Hono**, **TypeScript**, and **AWS DynamoDB**.
It implements **Single Table Design** patterns to manage Users and Notes with deadlines.

## Features
- **User Management:** Create users with unique emails.
- **Note Management:** Create, Read, Update, Delete notes.
- **Advanced Querying:** Filter notes by deadline without using Table Scans.

## Tech Stack
- **Runtime:** Node.js 20+
- **Framework:** Hono
- **Database:** AWS DynamoDB (Single Table Design)
- **SDK:** AWS SDK v3 (Phase 1), ElectroDB (Phase 2)

## Setup Instructions

1.  **Clone the repository**
    ```bash
    git clone <your-repo-url>
    cd dynamodb-notes
    ```

2.  **Install Dependencies**
    ```bash
    npm install
    ```

3.  **Environment Variables**
    Create a `.env` file in the root directory:
    ```env
    AWS_REGION=your_region
    AWS_ACCESS_KEY_ID=your_access_key
    AWS_SECRET_ACCESS_KEY=your_secret_key
    DYNAMODB_TABLE_NAME=NotesApp
    ```

4.  **Run Development Server**
    ```bash
    npm run dev
    ```

## 📚 Documentation
- Check out DESIGN.md for schema details and architectural decisions.