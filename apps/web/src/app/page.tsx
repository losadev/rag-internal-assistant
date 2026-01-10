import { Button } from "./_components/Button";
import { HowItWorks } from "./_components/HowItWorks";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center  font-sans bg-app">
      <main className="flex min-h-screen w-full flex-col  items-center gap-16 p-8 sm:items-start text-app">
        <section className="px-4 py-10 md:py-16 bg-app w-full">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="mb-6 text-balance text-4xl font-bold tracking-tight text-foreground md:text-6xl">
              Ask questions grounded in your docs. With citations.
            </h1>
            <p className="mb-10 text-pretty text-lg text-muted-foreground md:text-xl">
              Upload internal docs, get answers with sources, trigger
              automations via n8n.
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button icon label="Upload docs" page="/upload" />
              <Button
                icon
                label="Open chat"
                page="/chat"
                bgColor="bg-card"
                txtColor="text-app"
                borderColor="border border-app"
                hoverBgColor="hover:bg-muted"
              />
            </div>
          </div>
        </section>

        <section className="w-full ">
          <div className="container mx-auto">
            <div className="grid gap-6 md:grid-cols-3">
              {/* Tarjeta 1: RAG with citations */}
              <div className="rounded-lg border border-app bg-card p-6 transition-shadow hover:shadow-md">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary bg-opacity-10">
                  <svg
                    className="h-6 w-6 text-primary"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-app mb-2">
                  RAG with citations
                </h3>
                <p className="text-sm text-muted">
                  Get accurate answers backed by direct references to your
                  source documents
                </p>
              </div>

              {/* Tarjeta 2: Tools via MCP */}
              <div className="rounded-lg border border-app bg-card p-6 transition-shadow hover:shadow-md">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary bg-opacity-10">
                  <svg
                    className="h-6 w-6 text-primary"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-app mb-2">
                  Tools via MCP
                </h3>
                <p className="text-sm text-muted">
                  Extend functionality with Model Context Protocol integrations
                </p>
              </div>

              {/* Tarjeta 3: Actions via n8n */}
              <div className="rounded-lg border border-app bg-card p-6 transition-shadow hover:shadow-md">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary bg-opacity-10">
                  <svg
                    className="h-6 w-6 text-primary"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-app mb-2">
                  Actions via n8n
                </h3>
                <p className="text-sm text-muted">
                  Trigger complex workflows and automations based on chat
                  interactions
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="w-full">
          <HowItWorks
            steps={[
              {
                number: 1,
                title: "Upload docs",
                description:
                  "Add your PDF, Markdown, or text files to build your knowledge base",
              },
              {
                number: 2,
                title: "Ask questions",
                description:
                  "Chat with your documents and get precise answers with source citations",
              },
              {
                number: 3,
                title: "Execute actions",
                description:
                  "Trigger workflows and automations directly from the conversation",
              },
            ]}
          />
        </section>
      </main>
    </div>
  );
}
