# FlashFlow

FlashFlow is an innovative web application designed to help users generate flashcards from documents using the power of AI agents. It provides a streamlined workflow for transforming textual content into effective study materials.

## Core Features

Based on the project blueprint, FlashFlow offers the following core features:

*   **Document Input:** Allows users to input document content (e.g., paste text, upload files - planned).
*   **AI Agent Selection:** Enables users to choose from different AI agents to process the document and generate flashcards.
*   **Flashcard Generation:** Utilizes selected AI agents to automatically create flashcards with questions and answers based on the input document.
*   **Flashcard Viewer:** Provides an interface to review and manage the generated flashcards.
*   **Agent Profiles:** Configurable AI agent profiles with specific instructions and behaviors for flashcard generation.

## Setup and Running

To set up and run the FlashFlow project locally, follow these steps:

1.  **Clone the repository:**
```
bash
    git clone <repository_url>
    
```
2.  **Navigate to the project directory:**
```
bash
    cd FlashFlow
    
```
3.  **Install dependencies:**
```
bash
    npm install
    
```
4.  **Configure AI Agents:** Ensure your AI agent configurations are set up correctly in `src/config/agent-profiles.ts`. You may need API keys or other credentials depending on the agents used.
5.  **Run the development server:**
```
bash
    npm run dev
    
```
The application should now be running at `http://localhost:3000`.

## Styling

FlashFlow utilizes a specific color scheme and typography to provide a consistent and visually appealing user interface.

**Color Scheme:**

*   **Primary:** Blue (exact shade to be defined)
*   **Secondary:** Green (exact shade to be defined)
*   **Accent:** Yellow (exact shade to be defined)
*   **Background:** White/Light Gray
*   **Text:** Dark Gray/Black

**Typography:**

*   **Font Family:** Sans-serif (specific font e.g., Inter, Roboto - to be defined)
*   **Headings:** Bold or Semi-bold
*   **Body Text:** Regular

*(Note: The exact color codes and font names can be further refined in the project's styling files.)*

## AI Agent Profiles

FlashFlow uses configurable agent profiles defined in `src/config/agent-profiles.ts`. These profiles dictate how different AI models or configurations behave when generating flashcards. The current agent profiles include:

*   **Default Agent:** A general-purpose agent for flashcard generation.
*   **Summarization Agent:** Focuses on creating flashcards that test understanding of summarized content.
*   **Detail Extraction Agent:** Designed to extract specific details and facts for flashcards.

*(Note: The specific capabilities and configurations of these agents are defined within the `src/config/agent-profiles.ts` file.)*