import { useEffect, useState } from "react";
import { HttpAgent } from "@ag-ui/client";
import { CopilotChat, CopilotKitProvider, CopilotThreadsDrawer } from "@copilotkit/react-core/v2";
import { FileSearch, Menu, MessageSquare, Pencil, Plus, Trash2, X } from "lucide-react";

interface Conversation {
    id: string;
    title: string;
    applicationGuid: string;
    updatedAt: string;
}

const AGENT_URL = import.meta.env.VITE_AGENT_URL ?? "http://127.0.0.1:8000";
const AGENT_ID = "now-analyzer";
const STORAGE_KEY = "now-analyzer-copilotkit-threads";

function createConversation(): Conversation {
    return { id: crypto.randomUUID(), title: "New analysis", applicationGuid: "", updatedAt: new Date().toISOString() };
}

function loadConversations(): Conversation[] {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        const conversations = stored ? (JSON.parse(stored) as Conversation[]) : [];
        return conversations.length > 0 ? conversations : [createConversation()];
    } catch {
        return [createConversation()];
    }
}

export default function App() {
    const [agent] = useState(() => new HttpAgent({ url: `${AGENT_URL}/now-analyzer` }));
    const [conversations, setConversations] = useState<Conversation[]>(loadConversations);
    const [activeId, setActiveId] = useState(() => loadConversations()[0].id);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const activeConversation = conversations.find((conversation) => conversation.id === activeId) ?? conversations[0];

    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));
    }, [conversations]);

    function newConversation() {
        const conversation = createConversation();
        setConversations((items) => [conversation, ...items]);
        setActiveId(conversation.id);
    }

    function updateConversation(id: string, update: (conversation: Conversation) => Conversation) {
        setConversations((items) => items.map((item) => (item.id === id ? update(item) : item)));
    }

    function deleteConversation(id: string) {
        setConversations((items) => {
            const remaining = items.filter((item) => item.id !== id);
            const next = remaining.length > 0 ? remaining : [createConversation()];
            if (id === activeId) setActiveId(next[0].id);
            return next;
        });
    }

    function renameConversation(conversation: Conversation) {
        const title = window.prompt("Conversation name", conversation.title)?.trim();
        if (title) updateConversation(conversation.id, (item) => ({ ...item, title, updatedAt: new Date().toISOString() }));
    }

    return (
        <CopilotKitProvider
            selfManagedAgents={{ [AGENT_ID]: agent }}
            defaultThrottleMs={30}
            enableInspector={false}
            onError={(event) => console.error("CopilotKit chat error", event.error)}
        >
            <main className="workspace">
                <aside className={`sidebar ${sidebarOpen ? "is-open" : ""}`}>
                    <div className="brand">
                        <span className="brand-mark">BC</span><span>NOW Analyst</span>
                        <button type="button" className="mobile-close" onClick={() => setSidebarOpen(false)} aria-label="Close conversations"><X size={18} /></button>
                    </div>
                    <button className="new-chat" type="button" onClick={newConversation}><Plus size={17} /> New analysis</button>
                    <nav className="conversation-list" aria-label="Conversations">
                        <p className="sidebar-label">Recent work</p>
                        {conversations.map((conversation) => (
                            <div className={`conversation-item ${conversation.id === activeConversation.id ? "active" : ""}`} key={conversation.id}>
                                <button type="button" onClick={() => setActiveId(conversation.id)}><MessageSquare size={15} /><span>{conversation.title}</span></button>
                                <div className="conversation-actions">
                                    <button type="button" aria-label="Rename conversation" onClick={() => renameConversation(conversation)}><Pencil size={14} /></button>
                                    <button type="button" aria-label="Delete conversation" onClick={() => deleteConversation(conversation.id)}><Trash2 size={14} /></button>
                                </div>
                            </div>
                        ))}
                    </nav>
                    <p className="sidebar-foot">Threads are saved in this browser.</p>
                </aside>
                <section className="chat-shell">
                    <header className="chat-header">
                        <button className="icon-button" type="button" onClick={() => setSidebarOpen((open) => !open)} aria-label="Toggle conversations"><Menu size={20} /></button>
                        <div><p className="eyebrow">Application completeness review</p><h1>{activeConversation.title}</h1></div>
                        <div className="connection-status"><span /> AG-UI connected</div>
                    </header>
                    <div className="application-bar">
                        <label htmlFor="application-guid">NOW application GUID</label>
                        <input id="application-guid" value={activeConversation.applicationGuid} onChange={(event) => updateConversation(activeConversation.id, (item) => ({ ...item, applicationGuid: event.target.value }))} placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" />
                    </div>
                    <CopilotThreadsDrawer agentId={AGENT_ID} />
                    <CopilotChat
                        agentId={AGENT_ID}
                        threadId={activeConversation.id}
                        className="now-copilot-chat"
                        labels={{
                            chatInputPlaceholder: activeConversation.applicationGuid ? "Ask a follow-up about this application..." : "Enter a NOW application GUID above, then request a review...",
                            welcomeMessageText: "Start an evidence-led NOW application review.",
                            chatDisclaimerText: "Evidence is drawn from indexed documents and Core API data.",
                        }}
                    />
                    <div className="starter-prompts"><FileSearch size={16} /><span>Ask for a complete review, a document inventory, or the highest-risk missing requirements.</span></div>
                </section>
            </main>
        </CopilotKitProvider>
    );
}