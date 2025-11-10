# Zenvoyer - Professional Invoice Management Platform
An AI-powered, visually stunning invoicing platform designed for freelancers and small businesses, running entirely on Cloudflare's edge network.
[cloudflarebutton]
Zenvoyer is a production-ready, visually stunning SaaS invoicing platform designed for modern freelancers, agencies, and small businesses. Built entirely on the Cloudflare serverless stack, it leverages Workers for backend logic and Durable Objects for stateful, persistent data storage. The application features a comprehensive multi-tiered role-based access control system (Super Admin, Admin, User, Sub-User) to manage platform, support, and business operations. Core functionalities include complete invoice, client, and product management, a dynamic dashboard with key performance indicators, and a beautiful, intuitive user interface. The system is designed with a sophisticated visual identity to convey professionalism and trust. It also integrates the AI capabilities of the underlying template to offer intelligent support and agentic features.
## ✨ Key Features
- **Multi-Role Architecture**: Comprehensive role-based access control for Super Admins, Admins, Users, and Sub-Users.
- **Complete Invoice Management**: Full CRUD operations for invoices, including PDF generation, status tracking, and payment recording.
- **Client & Product Management**: Easily manage clients and predefined products/services to streamline invoice creation.
- **Role-Specific Dashboards**: Dynamic, data-driven dashboards with KPIs and charts tailored to each user role.
- **Team Collaboration**: Invite and manage sub-users with granular, permission-based access control.
- **AI-Powered Assistance**: Integrated AI chat for support and performing agentic tasks.
- **Built on the Edge**: High-performance and scalable, running entirely on Cloudflare Workers and Durable Objects.
- **Visually Stunning UI**: A professional, modern, and fully responsive interface built with Tailwind CSS and shadcn/ui.
## 🛠️ Technology Stack
- **Frontend**: React 18, Vite, React Router
- **Backend**: Cloudflare Workers, Hono, Cloudflare Agents SDK
- **State Management**: Zustand (Client-side), Durable Objects (Server-side)
- **Styling**: Tailwind CSS, shadcn/ui
- **Forms**: React Hook Form with Zod for validation
- **Animation**: Framer Motion
- **Language**: TypeScript
- **Icons**: Lucide React
## 🚀 Getting Started
Follow these instructions to get a local copy up and running for development and testing purposes.
### Prerequisites
- [Bun](https://bun.sh/) (v1.0 or higher)
- A [Cloudflare account](https://dash.cloudflare.com/sign-up)
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/install-and-update/) installed and authenticated: `bunx wrangler login`
### Installation
1.  **Clone the repository:**
    ```sh
    git clone https://github.com/your-username/zenvoyer-invoicing-ai.git
    cd zenvoyer-invoicing-ai
    ```
2.  **Install dependencies:**
    ```sh
    bun install
    ```
### Configuration
1.  **Create a local environment file:**
    Create a file named `.dev.vars` in the root of the project. This file is used by Wrangler to load secrets for local development.
2.  **Add environment variables:**
    Copy the following content into your `.dev.vars` file and replace the placeholder values with your actual Cloudflare and other service credentials.
    ```ini
    # .dev.vars
    # Cloudflare AI Gateway URL
    # Format: https://gateway.ai.cloudflare.com/v1/YOUR_ACCOUNT_ID/YOUR_GATEWAY_ID/openai
    CF_AI_BASE_URL="your-cloudflare-ai-gateway-url"
    # Cloudflare API Key (or any key you've configured for your gateway)
    CF_AI_API_KEY="your-cloudflare-api-key"
    # (Optional) SerpAPI Key for web search tool
    # Get one from https://serpapi.com/
    SERPAPI_KEY="your-serpapi-key"
    ```
## 💻 Development
To start the local development server, which runs both the Vite frontend and the Cloudflare Worker simultaneously:
```sh
bun dev
```
- The frontend will be available at `http://localhost:3000`.
- The worker's API endpoints will be accessible under the same port, e.g., `http://localhost:3000/api/health`.
The application supports hot-reloading, so changes you make to the source code in the `src` and `worker` directories will be reflected automatically in your browser.
## ☁️ Deployment
This project is designed for seamless deployment to Cloudflare's global network.
1.  **Configure Production Secrets:**
    Before deploying, you must set your environment variables as secrets in your Cloudflare dashboard or via the Wrangler CLI.
    ```sh
    bunx wrangler secret put CF_AI_BASE_URL
    bunx wrangler secret put CF_AI_API_KEY
    bunx wrangler secret put SERPAPI_KEY
    ```
    You will be prompted to enter the value for each secret.
2.  **Deploy the application:**
    Run the deploy script to build the application and deploy it to Cloudflare.
    ```sh
    bun deploy
    ```
    Wrangler will handle the process of building the frontend assets, bundling the worker, and deploying everything to your Cloudflare account.
3.  **Deploy with the button:**
    [cloudflarebutton]
## 📁 Project Structure
-   `worker/`: Contains all the backend code that runs on Cloudflare Workers.
    -   `index.ts`: The entry point for the worker.
    -   `agent.ts`: The core `ChatAgent` Durable Object class.
    -   `app-controller.ts`: The `AppController` Durable Object for session management.
    -   `userRoutes.ts`: Defines the API routes for the application.
-   `src/`: Contains all the frontend React application code.
    -   `pages/`: Top-level page components.
    -   `components/`: Reusable UI components.
    -   `lib/`: Utility functions and client-side services.
    -   `hooks/`: Custom React hooks.
-   `wrangler.jsonc`: Configuration file for the Cloudflare Worker, including bindings to Durable Objects and other services.
## 📄 License
This project is licensed under the MIT License. See the `LICENSE` file for details.